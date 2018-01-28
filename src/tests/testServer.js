const { migrateDatabase, seedDatabase } = require('./testDatabase.js')
const express = require('express')
const { graphqlExpressMiddleware } = require('./schema')
const http = require('spdy')

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
http.createServer(options, app).listen(process.env.PORT || 8080, async () => {
  console.log(`http/https/h2 server runs on ${process.env.PORT || 8080}`)
  await migrateDatabase()
  await seedDatabase()
})
