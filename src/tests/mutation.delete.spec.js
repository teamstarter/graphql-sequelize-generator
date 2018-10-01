const request = require('supertest')
const {
  migrateDatabase,
  seedDatabase,
  deleteTables
} = require('./testDatabase.js')
const express = require('express')
const { graphqlExpressMiddleware } = require('./schema')
const http = require('spdy')
const bodyParser = require('body-parser')

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
describe('Test the delete mutation', () => {
  beforeAll(async () => {
    app = express()
    app.use('/graphql', bodyParser.json(), graphqlExpressMiddleware)
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

  it('Check that you can delete an entity', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
        query getUser1 {
          user: user(id: 5) {
            id
            name
          }
        }
        &operationName=getUser1`
      )
      .set('userId', 1)
    const user = response.body.data.user
    expect(user).toMatchSnapshot('The user 5 should not exist anymore')

    const responseMutation = await request(server)
      .post('/graphql')
      .set('userid', 1)
      .send({
        query: `mutation userDelete($id: Int!) {
              userDelete(id: $id)
            }`,
        variables: {
          id: 5
        },
        operationName: 'userDelete'
      })
    expect(responseMutation.body.data.userDelete).toMatchSnapshot()

    const response2 = await request(server)
      .get(
        `/graphql?query=
          query getUser1 {
            user: user(id: 5) {
              id
              name
            }
          }
          &operationName=getUser1`
      )
      .set('userId', 1)
    const userDeleted = response2.body.data.user
    expect(userDeleted).toMatchSnapshot('The user 5 should not exist anymore')
  })
})
