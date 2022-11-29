import { GraphQLSchema } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginCacheControlDisabled } from '@apollo/server/plugin/disabled'
import { useServer } from 'graphql-ws/lib/use/ws'

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
  callWebhook = () => null,
  wsServer = null,
  globalPreCallback = () => null
}: {
  graphqlSchemaDeclaration: GraphqlSchemaDeclarationType
  types: InAndOutTypes
  models: SequelizeModels
  customMutations?: MutationList
  apolloServerOptions?: any
  pubSubInstance?: PubSub | null
  callWebhook: Function
  wsServer: any
  globalPreCallback?: GlobalPreCallback
}): ApolloServer {
  const graphqlSchema = new GraphQLSchema(
    generateSchema({
      graphqlSchemaDeclaration,
      customMutations,
      types,
      models,
      globalPreCallback,
      pubSubInstance,
      callWebhook
    })
  )

  // Hand in the schema we just created and have the
  // WebSocketServer start listening.
  if (wsServer) {
    useServer({ schema: graphqlSchema }, wsServer)
  }

  return new ApolloServer({
    schema: graphqlSchema,
    plugins: [ApolloServerPluginCacheControlDisabled()],
    ...apolloServerOptions
  })
}
