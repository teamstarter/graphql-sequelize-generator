const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupTestServer')

/**
 * Starting the tests
 */
describe('Test the count resolvers', () => {
  let server = null
  let trace = []
  const globalPreCallback = (type) => {
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

  it('Check that you can query a custom list resolver', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getUserAndCount {
              user {
                id
              }
              userCount
          }`
      )
      .set('userId', 1)
    expect(response.body.data.user).not.toBeUndefined()
    expect(response.body.data).toMatchSnapshot('Users ids and count')
    expect(response.body.data.user.length).toBe(response.body.data.userCount)
    expect(trace).toMatchSnapshot()
  })

  it('Check that you can count a list with an extra agrument', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query user {
              user {
                id
              }
              userCount (departmentId : 1)
          }`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.user).not.toBeUndefined()
    expect(response.body.data).toMatchSnapshot(
      'Users ids and count with an extra argument'
    )
    expect(response.body.data.user.length).toBe(response.body.data.userCount)
    expect(trace).toMatchSnapshot()
  })

  it('Check that you can inject types attributes and associations into a random Type', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getOddUsers {
            users: oddUser(limit:10) {
              id
              name
              company {
                id
              }
            }
          }`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.users).not.toBeUndefined()
    expect(response.body.data).toMatchSnapshot('Users ids should only be odd.')
    expect(trace).toMatchSnapshot()
  })

  it('Check that you cannot query the count resolver if it is not defined', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getLogCount {
              logCount
          }`
      )
      .set('logId', 1)
    expect(response.body.data).toBeUndefined()
    expect(response.error).toMatchSnapshot()
    expect(trace).toMatchSnapshot()
  })
})
