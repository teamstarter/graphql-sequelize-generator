const request = require('supertest')
const {
  migrateDatabase,
  seedDatabase,
  deleteTables
} = require('./testDatabase.js')
const express = require('express')
const { graphqlExpressMiddleware } = require('./schema')
const http = require('spdy')

let app = null
let server = null

var options = {
  spdy: {
    plain: true
  }
}

/**
 * Starting the tests
 */
describe('Test the custom resolvers', () => {
  beforeAll(async () => {
    app = express()
    app.use('/graphql', graphqlExpressMiddleware)
    server = await new Promise((resolve, reject) => {
      const newServer = http
        .createServer(options, app)
        .listen(process.env.PORT || 8080, () => {
          resolve(newServer)
        })
    })
  })

  afterAll(() =>
    Promise.all([
      new Promise((resolve, reject) => server.close(() => resolve()))
    ])
  )

  beforeEach(async () => {
    try {
      await migrateDatabase()
      await seedDatabase()
    } catch (e) {
      console.log('Critical error during the database migration', e.message, e)
      throw e
    }
  })

  afterEach(async () => {
    await deleteTables()
  })

  it('Check that you can query a custom list resolver', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getDepartments {
            departments: department {
              id
              name
            }
          }
          &operationName=getDepartments`
      )
      .set('userId', 1)
    expect(response.body.data.departments).toMatchSnapshot('A few departments')
  })
})
