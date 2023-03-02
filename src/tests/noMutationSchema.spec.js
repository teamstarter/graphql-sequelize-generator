const request = require('supertest')
const express = require('express')
const http = require('spdy')
const cors = require('cors')
const { json } = require('body-parser')
const { expressMiddleware } = require('@apollo/server/express4')

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

    const app = express()
    const httpServer = http.createServer(
      {
        spdy: {
          plain: true
        }
      },
      app
    )

    const graphqlServer = generateApolloServer({
      graphqlSchemaDeclaration,
      types,
      models,
      apolloServerOptions: {
        playground: true,
        csrfPrevention: false
      }
    })

    await graphqlServer.start()

    app.use(
      '/graphql',
      cors(),
      json(),
      expressMiddleware(graphqlServer, {
        context: async ({ req }) => ({ token: req.headers.token })
      })
    )

    await new Promise(resolve => {
      httpServer.listen(process.env.PORT || 8080, () => {
        resolve()
      })
    })

    const response = await request(httpServer)
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
      new Promise(resolve => httpServer.close(() => resolve()))
    ])
  })
})
