const express = require('express')
const http = require('spdy')
const cors = require('cors')
const { json } = require('body-parser')
const { createContext, EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize')

const setupServer = require('./schema')
const models = require('./models')

const { migrateDatabase, seedDatabase } = require('./testDatabase.js')
const { expressMiddleware } = require('@apollo/server/express4')

async function startServer() {
  const app = express()

  const options = {
    spdy: {
      plain: true
    }
  }
  const httpServer = http.createServer(options, app)

  const { server } = setupServer(console.log, httpServer)
  await server.start()
  /**
   * This is the test server.
   * Used to allow the access to the Graphql Playground at this address: http://localhost:8080/graphql.
   * Each time the server is starter, the database is reset.
   */
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

  httpServer.listen(process.env.PORT || 8080, async () => {
    console.log(
      `🚀 http/https/h2 server runs on ${process.env.PORT ||
        8080}, check the playground here: http://localhost:${process.env.PORT ||
        8080}/graphql`
    )
    await migrateDatabase()
    await seedDatabase()
  })
}

startServer()
