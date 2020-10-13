const { GraphQLSchema } = require('graphql')
const { ApolloServer } = require('apollo-server-express')

const generateSchema = require('./schema')

const generateApolloServer = ({
  graphqlSchemaDeclaration,
  customMutations,
  types,
  models,
  apolloServerOptions = {},
  pubSubInstance = null,
  globalPreCallback = () => null
}) => {
  const graphqlSchema = new GraphQLSchema(
    generateSchema({
      graphqlSchemaDeclaration,
      customMutations,
      types,
      models,
      globalPreCallback,
      pubSubInstance
    })
  )

  return new ApolloServer({
    schema: graphqlSchema,
    cacheControl: false,
    ...apolloServerOptions
  })
}

module.exports = generateApolloServer
