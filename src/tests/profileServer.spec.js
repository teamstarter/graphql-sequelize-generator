const request = require('supertest')

const { deleteTables } = require('./testDatabase.js')
const { createServer, closeServer, resetDb } = require('./setupTestServer')

/**
 * The 'read-only' profile of the test schema, served over HTTP.
 *
 * profileSchema.spec.js proves the shape of the generated schema; this proves
 * the server built from it actually behaves that way — a request for something
 * outside the profile is rejected at validation, before any resolver runs.
 *
 * Exactly ONE server is built in this file, and it is built with a profile.
 * `types` is module-level in testSchema.js and `injectAssociations` mutates it
 * in place, guarding on `associationsInjected`, so a second build in the same
 * module instance would silently reuse the first build's associations. Jest
 * gives each test file its own module registry, which is what makes this safe.
 * If you need to exercise another profile, add another spec file.
 */
describe('A server built for the read-only profile', () => {
  let server = null

  beforeAll(async () => {
    server = await createServer({}, () => null, false, 'read-only')
  })

  afterAll(() => closeServer(server))

  beforeEach(async () => {
    await resetDb()
  })

  afterEach(async () => {
    await deleteTables()
  })

  const query = source =>
    request(server)
      .get(`/graphql?query=${encodeURIComponent(source)}`)
      .set('userId', 1)

  it('serves an endpoint the profile declares', async () => {
    const response = await query(`query { company { id name } }`)

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.company.length).toBeGreaterThan(0)
  })

  it('serves a custom endpoint the profile declares', async () => {
    const response = await query(`query { oddUser { handleAdditionalFields } }`)

    expect(response.body.errors).toBeUndefined()
  })

  it('does not expose an endpoint that declares no profile', async () => {
    const response = await query(`query { companyType { id } }`)

    expect(response.body.errors[0].message).toMatch(
      /Cannot query field "companyType"/
    )
  })

  it('prunes an association whose target declares no profile', async () => {
    // The real boundary: `companyType` is gone from the type graph, not merely
    // from the root query, so it cannot be reached by nesting either.
    const response = await query(`query { company { id type { id } } }`)

    expect(response.body.errors[0].message).toMatch(
      /Cannot query field "type" on type "company"/
    )
  })

  it('keeps an association whose target declares the profile', async () => {
    // The control for the assertion above: without it, the pruning test would
    // pass just as happily if associations were broken altogether.
    const response = await query(`query { company { id departments { id } } }`)

    expect(response.body.errors).toBeUndefined()
  })

  it('honours excludeFromRoot from the profile', async () => {
    // `department` is reachable through `company` (asserted above) but has no
    // root query of its own in this profile.
    const response = await query(`query { department { id } }`)

    expect(response.body.errors[0].message).toMatch(
      /Cannot query field "department"/
    )
  })

  it('has no mutations at all', async () => {
    const response = await query(`query { __schema { mutationType { name } } }`)

    expect(response.body.data.__schema.mutationType).toBeNull()
  })

  it('rejects a mutation the full schema would accept', async () => {
    const response = await request(server)
      .post('/graphql')
      .send({
        query: `mutation { logThat(message: "nope") { message } }`,
      })
      .set('userId', 1)

    expect(response.body.errors[0].message).toMatch(
      /Schema is not configured to execute mutation operation/i
    )
  })
})
