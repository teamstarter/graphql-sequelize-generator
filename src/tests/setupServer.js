const express = require('express')
const setupServer = require('./schema')
const http = require('spdy')
const { migrateDatabase, seedDatabase } = require('./testDatabase.js')

const createServer = async (options = {}, globalPreCallback = () => null) => {
  const app = express()
  options = {
    spdy: { plain: true },
    ...options
  }
  const { server } = setupServer(globalPreCallback)
  server.applyMiddleware({ app, path: '/graphql' })
  const serverHttp = await new Promise(resolve => {
    const newServer = http
      .createServer(options, app)
      .listen(process.env.PORT || 8080, () => {
        resolve(newServer)
      })
  })
  return serverHttp
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
