const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupServer')

/**
 * Starting the tests
 */
describe('Test the custom resolvers', () => {
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
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.departments).not.toBeUndefined()
    expect(response.body.data.departments).toMatchSnapshot('A few departments')
  })
})
