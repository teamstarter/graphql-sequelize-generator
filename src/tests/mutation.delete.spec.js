const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./utils')

/**
 * Starting the tests
 */
describe('Test the delete mutation', () => {
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
