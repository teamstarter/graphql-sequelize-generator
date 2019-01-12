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
    const companies = response.body.data.companies
    expect(companies).toMatchSnapshot(
      'All companies with users and their department'
    )
  })
})
