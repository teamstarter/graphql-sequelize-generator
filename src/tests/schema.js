const models = require('./models')
const graphqlHTTP = require('express-graphql')
const { generateModelTypes, generateSchema } = require('./../index.js')
const { GraphQLSchema } = require('graphql')

const graphqlSchemaDeclaration = {}
const modelTypes = generateModelTypes(models)

graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ['list', 'create']
}

graphqlSchemaDeclaration.company = {
  model: models.company,
  actions: ['list', 'create']
}

const schema = generateSchema(modelTypes, graphqlSchemaDeclaration)

const graphqlSchemaInstance = new GraphQLSchema(schema)

module.exports = {
  graphqlHttpServer: graphqlHTTP(req => ({
    schema: graphqlSchemaInstance,
    graphiql: true
  })),
  schema: graphqlSchemaInstance
}
