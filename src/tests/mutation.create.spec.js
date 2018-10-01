const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./utils')

/**
 * Starting the tests
 */
describe('Test the create mutation', () => {
  let server = null

  beforeAll(async () => {
    server = await createServer()
  })

  afterAll(() => closeServer(server))

  beforeEach(async () => {
    await resetDb()
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
