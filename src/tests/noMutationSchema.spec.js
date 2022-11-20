const request = require('supertest')
const express = require('express')
const http = require('spdy')
const { generateApolloServer, generateModelTypes } = require('./../../lib')

const { deleteTables } = require('./testDatabase.js')
const { resetDb } = require('./setupServer')
const models = require('./models')

/**
 * Starting the tests
 */
describe('Test the creation a schema without mutations', () => {
  beforeEach(async () => {
    await resetDb()
  })

  afterEach(async () => {
    await deleteTables()
  })

  it('A schema can be created without mutations', async () => {
    const graphqlSchemaDeclaration = {}
    const types = generateModelTypes(models)

    graphqlSchemaDeclaration.company = {
      model: models.companyType,
      actions: ['list']
    }

    const graphqlServer = generateApolloServer({
      graphqlSchemaDeclaration,
      types,
      models,
      apolloServerOptions: {
        playground: true
      }
    })

    const app = express()
    await graphqlServer.start()
    graphqlServer.applyMiddleware({ app, path: '/graphql' })
    const serverHttp = await new Promise(resolve => {
      const newServer = http
        .createServer(
          {
            spdy: { plain: true }
          },
          app
        )
        .listen(process.env.PORT || 8080, () => {
          resolve(newServer)
        })
    })

    const response = await request(serverHttp)
      .get(
        `/graphql?query=
          query getCompanies {
            companies: company {
              id
              name
            }
          }
          &operationName=getCompanies`
      )
      .set('userId', 1)
    expect(response.body.errors).toBeUndefined()
    const companies = response.body.data.companies
    expect(companies).toMatchSnapshot('All companies')

    await Promise.all([
      new Promise(resolve => serverHttp.close(() => resolve()))
    ])
  })
})
