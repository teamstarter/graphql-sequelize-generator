const express = require('express')
const { expressMiddleware } = require('@apollo/server/express4')
const { createContext, EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize')

const setupServer = require('./testSchema.js')
const http = require('spdy')
const cors = require('cors')
const { json } = require('body-parser')
const { migrateDatabase, seedDatabase } = require('./testDatabase.js')
const models = require('./models/index.js')

/**
 * `profile` builds the schema for one audience rather than the full one.
 *
 * Only ONE server per test file may be built with a profile: `types` is
 * module-level in testSchema.js and `injectAssociations` mutates it in place,
 * so a second build in the same module instance would reuse the first build's
 * associations and prune nothing. Jest gives each test file its own module
 * registry, which is what keeps this safe.
 */
const createServer = async (
  options = {},
  globalPreCallback = () => null,
  withGeneratedHooks = false,
  profile = null
) => {
  const app = express()
  options = {
    spdy: { plain: true },
    ...options,
  }
  const httpServer = http.createServer(options, app)

  const { server } = setupServer(
    globalPreCallback,
    httpServer,
    withGeneratedHooks,
    profile
  )
  await server.start()
  app.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req, connection }) => {
        const contextDataloader = createContext(models.sequelize)
        // Connection is provided when a webSocket is connected.
        if (connection) {
          // check connection for metadata
          return {
            ...connection.context,
            [EXPECTED_OPTIONS_KEY]: contextDataloader,
          }
        }

        // This is an example of context manipulation.
        return {
          ...req,
          bootDate: '2017-01-01',
          [EXPECTED_OPTIONS_KEY]: contextDataloader,
        }
      },
    })
  )

  await new Promise((resolve) => {
    httpServer.listen(process.env.PORT || 8080, () => {
      resolve()
    })
  })
  return httpServer
}

const closeServer = async (server) => {
  await Promise.all([new Promise((resolve) => server.close(() => resolve()))])
}

const resetDb = async () => {
  try {
    await migrateDatabase()
    await seedDatabase()
  } catch (e) {
    console.log('Critical error during the database migration', e.message, e)
    throw e
  }
}

module.exports = {
  createServer,
  closeServer,
  resetDb,
}
