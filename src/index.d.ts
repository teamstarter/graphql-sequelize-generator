import { ApolloServer } from '@apollo/server'
import {
  GraphQLFieldResolver,
  GraphQLObjectType,
  GraphQLSchemaConfig,
} from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { FindOptions } from 'sequelize/types'
import {
  GlobalPreCallback,
  GraphqlSchemaDeclarationType,
  ModelDeclarationType,
  MutationList,
  OutputTypes,
  SequelizeModel,
  SequelizeModels,
  TInfo,
  InAndOutTypes,
} from '../types'

export function generateApolloServer({
  graphqlSchemaDeclaration,
  customMutations,
  types,
  models,
  wsServer,
  apolloServerOptions,
  pubSubInstance,
  callWebhook,
  globalPreCallback,
}: {
  graphqlSchemaDeclaration: GraphqlSchemaDeclarationType
  types: InAndOutTypes
  models: SequelizeModels
  wsServer: any
  customMutations?: MutationList
  apolloServerOptions?: any
  pubSubInstance?: PubSub | null
  callWebhook: Function
  globalPreCallback?: GlobalPreCallback
}): ApolloServer
export function generateSchema({
  graphqlSchemaDeclaration,
  types,
  models,
  customMutations,
  globalPreCallback,
  pubSubInstance,
  callWebhook,
}: {
  graphqlSchemaDeclaration: GraphqlSchemaDeclarationType
  types: InAndOutTypes
  models: SequelizeModels
  customMutations: MutationList
  globalPreCallback?: GlobalPreCallback
  pubSubInstance: PubSub | null
  callWebhook: Function
}): GraphQLSchemaConfig
export function generateModelTypes(models: SequelizeModels): InAndOutTypes
export function generateCount(
  model: SequelizeModel,
  schemaDeclaration: ModelDeclarationType,
  globalPreCallback: GlobalPreCallback
): GraphQLFieldResolver<any, any, any>
export function removeUnusedAttributes(
  findOptions: FindOptions,
  info: TInfo,
  currentModel: SequelizeModel,
  models: SequelizeModels,
  keep: Array<string>
): FindOptions
export function injectAssociations(
  modelGraphQLType: GraphQLObjectType,
  graphqlSchemaDeclaration: GraphqlSchemaDeclarationType,
  outputTypes: OutputTypes,
  models: SequelizeModels,
  globalPreCallback: GlobalPreCallback,
  proxyModelName: string | null
): GraphQLObjectType
