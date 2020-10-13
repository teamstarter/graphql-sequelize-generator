const { GraphQLSchema } = require('graphql')
const { ApolloServer } = require('apollo-server-express')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateSc... Remove this comment to see the full error message
const generateSchema = require('./schema')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateAp... Remove this comment to see the full error message
const generateApolloServer = ({
  graphqlSchemaDeclaration,
  customMutations,
  types,
  models,
  apolloServerOptions = {},
  pubSubInstance = null,
  globalPreCallback = () => null
}: any) => {
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
