const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupServer')

/**
 * Starting the tests
 */
describe('Test the API queries', () => {
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

  it('Check that you can query a model and an association', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getCompanies {
            companies: company {
              id
              name
              users {
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
    expect(companies).toMatchSnapshot('All companies')
  })

  it('Check that you can query sub associations', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getCompanies {
            companies: company {
              id
              name
              users {
                id
                name
                department {
                  id
                }
              }
            }
          }
          &operationName=getCompanies`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const companies = response.body.data.companies
    expect(companies).toMatchSnapshot(
      'All companies with users and their department'
    )
  })

  it('Check that you can sort', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getCompanies {
            companies: company(order: "name,id") {
              id
              name
            }
          }
          &operationName=getCompanies`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const companies = response.body.data.companies
    expect(companies).toMatchSnapshot('All companies sorted by name')
  })

  it('One can exclude an associated model', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getDepartments {
            department {
              id
              name
              company {
                id
              }
            }
          }
          &operationName=getDepartments`
      )
      .set('userId', 1)
    expect(response.body.errors).not.toBeUndefined()
    expect(response.body.errors).toMatchSnapshot()
  })

  it('One can exclude a basic field from a model', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getDepartments {
            department {
              id
              name
              updatedAt
            }
          }
          &operationName=getDepartments`
      )
      .set('userId', 1)
    expect(response.body.errors).not.toBeUndefined()
    expect(response.body.errors).toMatchSnapshot()
  })

  it('One can exclude a model from the root of the server.', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
          query getCompanySettings {
            companySetting {
              whiteLabelEnabled
            }
          }
          &operationName=getCompanySettings`
      )
      .set('userId', 1)
    expect(response.body.errors).not.toBeUndefined()
    expect(response.body.errors).toMatchSnapshot()

    const responseSuccess = await request(server)
      .get(
        `/graphql?query=
          query getCompanies {
            company {
              id
              settings {
                whiteLabelEnabled
              }
            }
          }
          &operationName=getCompanies`
      )
      .set('userId', 1)
    expect(responseSuccess.body.errors).toBeUndefined()
    expect(responseSuccess.body.data).toMatchSnapshot()
  })
})
