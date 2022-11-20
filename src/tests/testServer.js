const express = require('express')
const http = require('spdy')

const { migrateDatabase, seedDatabase } = require('./testDatabase.js')
const setupServer = require('./schema')

async function startServer() {
  const app = express()

  const options = {
    spdy: {
      plain: true
    }
  }

  const { server } = setupServer(console.log)
  await server.start()
  /**
   * This is the test server.
   * Used to allow the access to the Graphql Playground at this address: http://localhost:8080/graphql.
   * Each time the server is starter, the database is reset.
   */
  server.applyMiddleware({
    app,
    path: '/graphql'
  })

  const serverHttp = http
    .createServer(options, app)
    .listen(process.env.PORT || 8080, async () => {
      console.log(
        `🚀 http/https/h2 server runs on ${process.env.PORT ||
          8080}, check the playground here: http://localhost:${process.env
          .PORT || 8080}/graphql`
      )
      await migrateDatabase()
      await seedDatabase()
    })

  server.installSubscriptionHandlers(serverHttp)
}

startServer()
