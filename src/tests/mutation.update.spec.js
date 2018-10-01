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
    const responseUser5PreUpdate = await request(server)
      .get(
        `/graphql?query=
        query getUsers {
          user: user(id: 5) {
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
    expect(responseUser5PreUpdate.body.data.user).toMatchSnapshot(
      'User 5 before update'
    )

    const responseUserCreate = await request(server)
      .post('/graphql')
      .set('userid', 1)
      .send({
        query: `mutation userUpdate($user: userInput!) {
              user : userUpdate(user: $user) {
                id
                name
                __typename
              }
            }`,
        variables: {
          user: {
            id: 5,
            name: 'edited name'
          }
        },
        operationName: 'userUpdate'
      })
    expect(responseUserCreate.body.data.user).toMatchSnapshot('Updated user')

    const responseUser5PostUpdate = await request(server)
      .get(
        `/graphql?query=
        query getUsers {
          user: user(id: 5) {
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
    expect(responseUser5PostUpdate.body.data.user).toMatchSnapshot(
      'User 5 post update'
    )
  })
})
