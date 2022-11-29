const express = require('express')
const { expressMiddleware } = require('@apollo/server/express4')
const { createContext, EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize')

const setupServer = require('./schema')
const http = require('spdy')
const cors = require('cors')
const { json } = require('body-parser')
const { migrateDatabase, seedDatabase } = require('./testDatabase.js')
const models = require('./models')

const createServer = async (options = {}, globalPreCallback = () => null) => {
  const app = express()
  options = {
    spdy: { plain: true },
    ...options
  }
  const httpServer = http.createServer(options, app)

  const { server } = setupServer(globalPreCallback, httpServer)
  await server.start()
  //server.applyMiddleware({ app, path: '/graphql' })
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
            [EXPECTED_OPTIONS_KEY]: contextDataloader
          }
        }

        // This is an example of context manipulation.
        return {
          ...req,
          bootDate: '2017-01-01',
          [EXPECTED_OPTIONS_KEY]: contextDataloader
        }
      }
    })
  )

  await new Promise(resolve => {
    httpServer.listen(process.env.PORT || 8080, () => {
      resolve()
    })
  })
  return httpServer
}

const closeServer = async server => {
  await Promise.all([new Promise(resolve => server.close(() => resolve()))])
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
  resetDb
}
