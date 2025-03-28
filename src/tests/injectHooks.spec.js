const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupTestServer.js')

/**
 * Starting the tests
 */
describe('Test that it is possible to inject hooks for any action', () => {
  let server = null
  let trace = []
  const globalPreCallback = (type) => {
    trace.push(type)
  }

  beforeAll(async () => {
    server = await createServer({}, globalPreCallback, true)
  })

  afterAll(() => closeServer(server))

  beforeEach(async () => {
    trace = []
    await deleteTables()
    await resetDb()
  })

  afterEach(async () => {
    await deleteTables()
  })

  it('should inject hooks for list endpoint', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getUsers {
            users: user {
              id
              name
            }
          }
          &operationName=getUsers`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const users = response.body.data.users
    // No users should be returned, as user 1 is not in department 1
    expect(users.length).toBe(0)
  })

  it('should respect custom list resolver over injected hooks', async () => {
    // Query the sessions with the custom resolver
    const response = await request(server)
      .get(
        `/graphql?query=
          query getSessions {
            sessions: session {
              id
              lastActiveAt
              user {
                id
                name
              }
            }
          }
          &operationName=getSessions`
      )
      .set('userId', 1)

    expect(response.body.errors).toBeUndefined()
    const sessions = response.body.data.sessions
    // The custom resolver should return all sessions, including those for user 2
    // even though the injected hooks would normally filter out user 2
    expect(sessions.length).toBe(2)
    expect(sessions.some((session) => session.user.id === 2)).toBe(true)
  })

  it('should inject hooks for create endpoint', async () => {
    console.log('Starting create user test')
    const response = await request(server)
      .post('/graphql')
      .send({
        query: `
          mutation createUser {
            userCreate(user: {
              name: "Test User"
              companyId: 1
              departmentId: 1
            }) {
              id
              name
            }
          }
        `,
        operationName: 'createUser',
      })
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const createdUser = response.body.data.userCreate
    console.log('Created user:', createdUser)
    expect(createdUser).toMatchSnapshot()
  })

  it('should inject hooks for update endpoint', async () => {
    // First create a user
    await request(server)
      .post('/graphql')
      .send({
        query: `
          mutation createUser {
            userCreate(user: {
              name: "User to Update"
              companyId: 1
              departmentId: 1
            }) {
              id
              name
            }
          }
        `,
        operationName: 'createUser',
      })
      .set('userId', 1)

    // Then update the user
    const response = await request(server)
      .post('/graphql')
      .send({
        query: `
          mutation updateUser {
            userUpdate(user: {
              id: 1
              name: "Updated User"
            }) {
              id
              name
            }
          }
        `,
        operationName: 'updateUser',
      })
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const updatedUser = response.body.data.userUpdate
    expect(updatedUser).toMatchSnapshot()
  })

  it('should inject hooks for delete endpoint', async () => {
    // First create a user
    const result = await request(server)
      .post('/graphql')
      .send({
        query: `
          mutation createUser {
            userCreate(user: {
              name: "User to Delete"
              companyId: 1
              departmentId: 1
            }) {
              id
              name
            }
          }
        `,
        operationName: 'createUser',
      })
      .set('userId', 1)

    // Then delete the user
    expect(result.body.data.userCreate.id).toBeDefined()
    const response = await request(server)
      .post('/graphql')
      .send({
        query: `
          mutation deleteUser {
            userDelete(id: ${result.body.data.userCreate.id}, log: true)
          }
        `,
        operationName: 'deleteUser',
      })
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.userDelete).toBe(1)

    // Verify the log was created
    const logResponse = await request(server)
      .get(
        `/graphql?query=
          query getLogs {
            logs: log {
              id
              message
            }
          }
          &operationName=getLogs`
      )
      .set('userId', 1)
    expect(logResponse.body.errors).toBeUndefined()
    const logs = logResponse.body.data.logs
    expect(logs).toMatchSnapshot()
  })
})
