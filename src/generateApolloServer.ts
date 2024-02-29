import { ApolloServer } from '@apollo/server'
import { ApolloServerPluginCacheControlDisabled } from '@apollo/server/plugin/disabled'
import { GraphQLSchema } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { useServer } from 'graphql-ws/lib/use/ws'

import { ConnectionInitMessage, ServerOptions } from 'graphql-ws'
import generateSchema from './schema'
import {
  GlobalPreCallback,
  GraphqlSchemaDeclarationType,
  InAndOutTypes,
  MutationList,
  SequelizeModels,
} from './types/types'

export default function generateApolloServer<ContextExtraAttributes = {}>({
  graphqlSchemaDeclaration,
  customMutations,
  types,
  models,
  apolloServerOptions = {},
  pubSubInstance = null,
  callWebhook = () => null,
  wsServer = null,
  globalPreCallback = () => null,
  useServerOptions = {},
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
  useServerOptions: ServerOptions<
    ConnectionInitMessage['payload'],
    ContextExtraAttributes
  >
}): ApolloServer {
  const graphqlSchema = new GraphQLSchema(
    generateSchema({
      graphqlSchemaDeclaration,
      customMutations,
      types,
      models,
      globalPreCallback,
      pubSubInstance,
      callWebhook,
    })
  )

  // Hand in the schema we just created and have the
  // WebSocketServer start listening.
  if (wsServer) {
    // @ts-ignore
    useServer({ schema: graphqlSchema, ...useServerOptions }, wsServer)
  }

  return new ApolloServer({
    schema: graphqlSchema,
    plugins: [ApolloServerPluginCacheControlDisabled()],
    ...apolloServerOptions,
  })
}
