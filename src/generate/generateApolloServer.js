const { GraphQLSchema } = require('graphql')
const { ApolloServer } = require('apollo-server-express')

const generateSchema = require('./schema')

const generateApolloServer = (
  graphqlSchemaDeclaration,
  types,
  models,
  serverOptions = {},
  pubSubInstance = null
) => {
  const graphqlSchema = new GraphQLSchema(
    generateSchema({
      graphqlSchemaDeclaration,
      types,
      models,
      globalPreCallback: serverOptions.globalPreCallback,
      pubSubInstance
    })
  )

  return new ApolloServer({
    schema: graphqlSchema,
    cacheControl: false,
    ...serverOptions
  })
}

module.exports = generateApolloServer
