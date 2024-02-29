const request = require('supertest')
const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupTestServer')
const models = require('./models')

/**
 * Starting the tests
 */
describe('Test the delete mutation', () => {
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
  it('Check that you can delete an entity', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
        query getUser1 {
          user: user(id: 5) {
            id
            name
          }
        }
        &operationName=getUser1`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const user = response.body.data.user
    expect(user).not.toBeUndefined()
    expect(user).toMatchSnapshot('The user 5 should not exist anymore')

    const responseMutation = await request(server)
      .post('/graphql')
      .set('userid', 1)
      .send({
        query: `mutation userDelete($id: Int!) {
              userDelete(id: $id)
            }`,
        variables: {
          id: 5,
        },
        operationName: 'userDelete',
      })
    expect(responseMutation.body.errors).toBeUndefined()
    expect(responseMutation.body.data.userDelete).not.toBeUndefined()
    expect(responseMutation.body.data.userDelete).toMatchSnapshot()

    const response2 = await request(server)
      .get(
        `/graphql?query=
          query getUser1 {
            user: user(id: 5) {
              id
              name
            }
          }
          &operationName=getUser1`
      )
      .set('userId', 1)
    expect(response2.body.errors).toBeUndefined()
    const userDeleted = response2.body.data.user
    expect(userDeleted).not.toBeUndefined()
    expect(userDeleted).toMatchSnapshot('The user 5 should not exist anymore')
    expect(trace).toMatchSnapshot()
  })

  it('Check that you can add extra arguments', async () => {
    const response = await request(server)
      .get(
        `/graphql?query=
        query getUser1 {
          user: user(id: 5) {
            id
            name
          }
        }
        &operationName=getUser1`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const user = response.body.data.user
    expect(user).not.toBeUndefined()
    expect(user).toMatchSnapshot('The user 5 should not exist anymore')

    const lastId = await models.log.max('id')
    expect(lastId).toBe(null)

    const responseMutation = await request(server)
      .post('/graphql')
      .set('userid', 1)
      .send({
        query: `mutation userDelete($id: Int!) {
              userDelete(id: $id, log: true)
            }`,
        variables: {
          id: 5,
        },
        operationName: 'userDelete',
      })
    expect(responseMutation.body.errors).toBeUndefined()
    expect(responseMutation.body.data.userDelete).not.toBeUndefined()
    expect(responseMutation.body.data.userDelete).toMatchSnapshot()

    const response2 = await request(server)
      .get(
        `/graphql?query=
          query getUser1 {
            user: user(id: 5) {
              id
              name
            }
          }
          &operationName=getUser1`
      )
      .set('userId', 1)
    expect(response2.body.errors).toBeUndefined()
    const userDeleted = response2.body.data.user
    expect(userDeleted).not.toBeUndefined()
    expect(userDeleted).toMatchSnapshot('The user 5 should not exist anymore')
    expect(trace).toMatchSnapshot()

    const logs = await models.log.findAll()

    expect(
      logs.map((t) => {
        const { createdAt, updatedAt, ...rest } = t.get({ plain: true })
        return rest
      })
    ).toMatchSnapshot()
  })
})
