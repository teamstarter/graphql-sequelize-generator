const { GraphQLSchema } = require('graphql')
const { graphqlExpress } = require('apollo-server-express')

const generateSchema = require('./schema')

const generateGraphqlExpressMiddleware = (
  graphqlSchemaDeclaration,
  modelTypes,
  models,
  pubSubInstance,
  serverOptions = {}
) => {
  const graphqlSchema = new GraphQLSchema(
    generateSchema(graphqlSchemaDeclaration, modelTypes, models)
  )

  return graphqlExpress(req => ({
    schema: graphqlSchema,
    cacheControl: false,
    ...serverOptions
  }))
}

module.exports = generateGraphqlExpressMiddleware
