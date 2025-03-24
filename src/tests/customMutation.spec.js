const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupTestServer')

/**
 * Starting the tests
 */
describe('Test the custom mutations', () => {
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
          message: 'Hello',
        },
        operationName: 'logThat',
      })
    expect(responseUserCreate.body.errors).toBeUndefined()
    expect(responseUserCreate.body.data.logThat).not.toBeUndefined()
    expect(responseUserCreate.body.data.logThat).toMatchSnapshot(
      'The sent message'
    )
    expect(trace).toMatchSnapshot()
  })

  it('Check that you can call an additional mutation on a model', async () => {
    const response = await request(server)
      .post('/graphql')
      .set('userid', 1)
      .send({
        query: `mutation anonymizeLog($logId: String) {
              anonymizeLog(logId: $logId) {
                id
                message
              }
            }`,
        variables: {
          logId: '123',
        },
        operationName: 'anonymizeLog',
      })
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.anonymizeLog).not.toBeUndefined()
    expect(response.body.data.anonymizeLog).toMatchSnapshot(
      'The anonymized log'
    )
    expect(trace).toMatchSnapshot()
  })

  it('Check that you can use a completely custom create mutation', async () => {
    const response = await request(server)
      .post('/graphql')
      .set('userid', 1)
      .send({
        query: `mutation companyCreate($company: companyInput!, $setupOptions: CompanySetupOptions) {
              companyCreate(company: $company, setupOptions: $setupOptions) {
                id
                name
                users {
                  id
                  name
                }
                departments {
                  id
                  name
                }
              }
            }`,
        variables: {
          company: {
            name: 'New Company with Setup',
            companyTypeId: 1,
            managerId: 1,
            type: {
              id: 1,
            },
          },
          setupOptions: {
            createDefaultDepartment: true,
            addDefaultUser: true,
          },
        },
        operationName: 'companyCreate',
      })
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.companyCreate).not.toBeUndefined()
    expect(response.body.data.companyCreate).toMatchSnapshot(
      'The created company with setup'
    )
    expect(trace).toMatchSnapshot()
  })
})
