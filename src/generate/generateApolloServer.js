const { GraphQLSchema } = require('graphql')
const { ApolloServer } = require('apollo-server-express')

const generateSchema = require('./schema')

const generateApolloServer = (
  graphqlSchemaDeclaration,
  modelTypes,
  models,
  serverOptions = {},
  pubSubInstance = null
) => {
  const graphqlSchema = new GraphQLSchema(
    generateSchema(graphqlSchemaDeclaration, modelTypes, models, pubSubInstance)
  )

  return new ApolloServer({
    schema: graphqlSchema,
    cacheControl: false,
    ...serverOptions
  })
}

module.exports = generateApolloServer
