const express = require('express')
const { graphqlExpressMiddleware } = require('./schema')
const http = require('spdy')
const bodyParser = require('body-parser')
const { migrateDatabase, seedDatabase } = require('./testDatabase.js')

const createServer = async (options = {}) => {
  const app = express()
  options = {
    spdy: { plain: true },
    ...options
  }
  app.use('/graphql', bodyParser.json(), graphqlExpressMiddleware)
  const server = await new Promise((resolve, reject) => {
    const newServer = http
      .createServer(options, app)
      .listen(process.env.PORT || 8080, () => {
        resolve(newServer)
      })
  })
  return server
}

const closeServer = async server => {
  await Promise.all([
    new Promise((resolve, reject) => server.close(() => resolve()))
  ])
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
