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
describe('Test the create mutation', () => {
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

  it('Check that you can create a new instance of one entity', async () => {
    const responseNoUser = await request(server)
      .get(
        `/graphql?query=
        query getUsers {
          user: user(id: 12501) {
            id
            name
            company {
              id
              name
            }
          }
        }
        &operationName=getUsers`
      )
      .set('userId', 1)
    expect(responseNoUser.body.data.user).toMatchSnapshot(
      'User 12501 does not exists yet.'
    )

    const responseUserCreate = await request(server)
      .post('/graphql')
      .set('userid', 1)
      .send({
        query: `mutation userCreate($user: userInput!) {
              user : userCreate(user: $user) {
                id
                name
                __typename
              }
            }`,
        variables: {
          user: {
            name: 'new user',
            departmentId: 1,
            companyId: 1
          }
        },
        operationName: 'userCreate'
      })
    expect(responseUserCreate.body.data.user).toMatchSnapshot('Created user')

    const response = await request(server)
      .get(
        `/graphql?query=
          query getUsers {
            user: user(id: 12501) {
              id
              name
              company {
                id
                name
              }
            }
          }
          &operationName=getUsers`
      )
      .set('userId', 1)
    expect(response.body.data.user).toMatchSnapshot('The new user')
  })
})
