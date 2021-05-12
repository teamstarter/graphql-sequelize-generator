const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupServer')

const userCreate = user => ({
  query: `mutation userCreate($user: userInput!) {
    userCreate(user: $user) {
      id
      name
    }
  }`,
  variables: {
    user
  },
  operationName: null
})

/**
 * Starting the tests
 */
describe('Test the create mutation', () => {
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

  it('Check that you can create a new instance of one entity', async () => {
    const responseNoUser = await request(server)
      .get(
        `/graphql?query=
        query getUsers {
          user: user(id: 12501) {
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
    expect(responseNoUser.body.errors).toBeUndefined()
    expect(responseNoUser.body.data.user).not.toBeUndefined()
    expect(responseNoUser.body.data.user).toMatchSnapshot(
      'User 12501 does not exists yet.'
    )

    const responseUserCreate = await request(server)
      .post('/graphql')
      .set('userid', 1)
      .send({
        query: `mutation userCreate($user: userInput!) {
              user : userCreate(user: $user) {
                id
                name
                __typename
              }
            }`,
        variables: {
          user: {
            name: 'new user',
            departmentId: 1,
            companyId: 1
          }
        },
        operationName: 'userCreate'
      })
    expect(responseUserCreate.body.errors).toBeUndefined()
    expect(responseUserCreate.body.data.user).not.toBeUndefined()
    expect(responseUserCreate.body.data.user).toMatchSnapshot('Created user')

    const response = await request(server)
      .get(
        `/graphql?query=
          query getUsers {
            user: user(id: 12501) {
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
    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.user).not.toBeUndefined()
    expect(response.body.data.user).toMatchSnapshot('The new user')
    expect(trace).toMatchSnapshot()
  })

  it('Check if you cannot duplicate entity according to attributes', async () => {
    const responseCreateJob = await request(server)
      .post('/graphql')
      .send(
        userCreate({
          name: 'new user',
          departmentId: 1,
          companyId: 1
        })
      )
    expect(responseCreateJob.body.errors).toBeUndefined()
    expect(responseCreateJob.body.data).toMatchSnapshot()

    const responseSameCreateJob = await request(server)
      .post('/graphql')
      .send(
        userCreate({
          name: 'new user',
          departmentId: 1,
          companyId: 1
        })
      )

    expect(responseCreateJob.body.errors).toBeUndefined()
    expect(responseSameCreateJob.body.data).toStrictEqual(
      responseCreateJob.body.data
    )
  })
})
