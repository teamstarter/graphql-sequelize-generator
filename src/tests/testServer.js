const express = require('express')
const http = require('spdy')
const { SubscriptionServer } = require('subscriptions-transport-ws')
const { execute, subscribe } = require('graphql')

const { migrateDatabase, seedDatabase } = require('./testDatabase.js')
const { graphqlExpressMiddleware, schema } = require('./schema')

let app = express()

var options = {
  spdy: {
    plain: true
  }
}

/**
 * This is the test server.
 * Used to allow the access to graphiql.
 * Each time the server is starter, the database is reset.
 */
app.use('/graphql', graphqlExpressMiddleware)
const server = http
  .createServer(options, app)
  .listen(process.env.PORT || 8080, async () => {
    console.log(`http/https/h2 server runs on ${process.env.PORT || 8080}`)
    await migrateDatabase()
    await seedDatabase()
  })

SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: async (connectionParams, socket) => {
      return { userId: 1 }
    }
  },
  {
    server,
    path: '/subscription'
  }
)
