const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupTestServer')

/**
 * Starting the tests
 */
describe('Test the custom endpoints', () => {
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

  it('Check that you can query a custom endpoint', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getContextFromCustomEndpoint {
            serverStatistics {
              serverBootDate
            }
          }`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.serverStatistics).not.toBeUndefined()
    expect(response.body.data.serverStatistics).toMatchSnapshot(
      'The server boot date.'
    )
  })
})
