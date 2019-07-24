const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupServer')

/**
 * Starting the tests
 */
describe('Test the custom mutations', () => {
  let server = null
  let trace = []
  const globalPreCallback = type => {
    trace.push(type)
  }

  beforeAll(async () => {
    server = await createServer({}, globalPreCallback)
  })

  afterAll(() => closeServer(server))

  beforeEach(async () => {
    trace = []
    await resetDb()
  })

  afterEach(async () => {
    await deleteTables()
  })

  it('Check that you can call a custom Mutation', async () => {
    const responseUserCreate = await request(server)
      .post('/graphql')
      .set('userid', 1)
      .send({
        query: `mutation logThat($message: String) {
              logThat(message: $message) {
                message
              }
            }`,
        variables: {
          message: 'Hello'
        },
        operationName: 'logThat'
      })
    expect(responseUserCreate.body.errors).toBeUndefined()
    expect(responseUserCreate.body.data.logThat).not.toBeUndefined()
    expect(responseUserCreate.body.data.logThat).toMatchSnapshot(
      'The sent message'
    )
    expect(trace).toMatchSnapshot()
  })
})
