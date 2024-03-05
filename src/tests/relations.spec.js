const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupTestServer')

/**
 * Starting the tests
 */
describe('Test the create mutation', () => {
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
  it('Check that you can query a model and a hasMany association', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getCompanies {
            companies: company(id : 1) {
              id
              name
              users {
                name
              }
            }
          }
          &operationName=getCompanies`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const companies = response.body.data.companies
    expect(companies).toMatchSnapshot()
    expect(companies[0].users).not.toBe(null)
  })
  it('Check that you can query a model and a belongsTo association', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getCompanies {
            companies: company(id : 3) {
              id
              name
              type {
                id 
                name
              }
            }
          }
          &operationName=getCompanies`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const companies = response.body.data.companies
    expect(companies).toMatchSnapshot()
    expect(companies[0].type).not.toBe(null)
  })
  it('Check that you can query a model and a hasOne association', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getCompanies {
            companies: company(id : 1) {
              id
              name
              settings {
                whiteLabelEnabled
              }
            }
          }
          &operationName=getCompanies`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const companies = response.body.data.companies
    expect(companies).toMatchSnapshot()
    expect(companies[0].settings).not.toBe(null)
  })
  it('Check that you can query a model and a belongsToMany association', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getCompanies {
            companies: company(id : 1) {
              id
              name
              tags {
                name
              }
            }
          }
          &operationName=getCompanies`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const companies = response.body.data.companies
    expect(companies).toMatchSnapshot()
    expect(companies[0].tags).not.toBe(null)
  })
})
