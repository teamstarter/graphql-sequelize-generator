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

  it('Check that you can create a new instance of one entity', async () => {
    const responseUser5PreUpdate = await request(server)
      .get(
        `/graphql?query=
        query getUsers {
          user: user(id: 5) {
            id
            name
            company {
              id
              name
            }
          }
        }
        &operationName=getUsers`
      )
      .set('userId', 1)
    expect(responseUser5PreUpdate.body.errors).toBeUndefined()
    expect(responseUser5PreUpdate.body.data.user).not.toBeUndefined()
    expect(responseUser5PreUpdate.body.data.user).toMatchSnapshot(
      'User 5 before update'
    )

    const responseUserCreate = await request(server)
      .post('/graphql')
      .set('userid', 1)
      .send({
        query: `mutation userUpdate($user: userInput!) {
              user : userUpdate(user: $user) {
                id
                name
                __typename
              }
            }`,
        variables: {
          user: {
            id: 5,
            name: 'edited name',
          },
        },
        operationName: 'userUpdate',
      })
    expect(responseUserCreate.body.errors).toBeUndefined()
    expect(responseUserCreate.body.data.user).not.toBeUndefined()
    expect(responseUserCreate.body.data.user).toMatchSnapshot('Updated user')

    const responseUser5PostUpdate = await request(server)
      .get(
        `/graphql?query=
        query getUsers {
          user: user(id: 5) {
            id
            name
            company {
              id
              name
            }
          }
        }
        &operationName=getUsers`
      )
      .set('userId', 1)
    expect(responseUser5PostUpdate.body.errors).toBeUndefined()
    expect(responseUser5PostUpdate.body.data.user).not.toBeUndefined()
    expect(responseUser5PostUpdate.body.data.user).toMatchSnapshot(
      'User 5 post update'
    )
    expect(trace).toMatchSnapshot()
  })

  it('Check that you can update an entity', async () => {
    const responseCompanyUpdate = await request(server)
      .post('/graphql')
      .set('userid', 1)
      .send({
        query: `mutation companyUpdate($company: companyInput!) {
              company : companyUpdate(company: $company) {
                id
                name
                __typename
              }
            }`,
        variables: {
          company: {
            id: 5,
            name: 'updated name',
          },
        },
        operationName: 'companyUpdate',
      })
    expect(responseCompanyUpdate.body.errors).toBeUndefined()
    expect(responseCompanyUpdate.body.data.company).not.toBeUndefined()
    expect(responseCompanyUpdate.body.data.company).toMatchSnapshot(
      'Updated company'
    )
  })
})
