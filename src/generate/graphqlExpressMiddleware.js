const { GraphQLSchema } = require('graphql')
const { ApolloServer } = require('apollo-server-express')

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

  return new ApolloServer({
    schema: graphqlSchema,
    cacheControl: false,
    ...serverOptions
  })
}

module.exports = generateGraphqlExpressMiddleware
