import { GraphQLSchema } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'

import {
  GlobalPreCallback,
  GraphqlSchemaDeclarationType,
  MutationList,
  SequelizeModels,
  InAndOutTypes
} from '../types'
import generateSchema from './schema'

export default function generateApolloServer({
  graphqlSchemaDeclaration,
  customMutations,
  types,
  models,
  apolloServerOptions = {},
  pubSubInstance = null,
  globalPreCallback = () => null
}: {
  graphqlSchemaDeclaration: GraphqlSchemaDeclarationType
  types: InAndOutTypes
  models: SequelizeModels
  customMutations?: MutationList
  apolloServerOptions?: ApolloServerExpressConfig
  pubSubInstance?: PubSub | null
  globalPreCallback?: GlobalPreCallback
}): ApolloServer {
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
