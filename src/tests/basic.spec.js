const request = require('supertest')
const {
  migrateDatabase,
  seedDatabase,
  deleteTables
} = require('./testDatabase.js')
const express = require('express')
const { graphqlHttpServer } = require('./schema')
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
describe('Test the API queries', () => {
  beforeAll(async () => {
    app = express()
    app.use('/graphql', graphqlHttpServer)
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

  it('Check that you can query a model and an association', async () => {
    const response = await request(server).get(
      `/graphql?query=
          query getCompanies {
            organizations: company {
              id
              name
              users {
                id
                name
              }
            }
          }
          &operationName=getCompanies`
    )
    const organizations = response.body.data.organizations
    expect(organizations).toMatchSnapshot('All companies')
  })
})
