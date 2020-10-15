import { GraphQLSchema } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'

import {
  GlobalPreCallback,
  graphqlSchemaDeclarationType,
  MutationList,
  SequelizeModels,
  Types
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
  graphqlSchemaDeclaration: graphqlSchemaDeclarationType
  customMutations: MutationList
  types: Types
  models: SequelizeModels
  apolloServerOptions: ApolloServerExpressConfig
  pubSubInstance: PubSub | null
  globalPreCallback: GlobalPreCallback
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
