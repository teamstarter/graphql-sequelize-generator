import { ApolloServer, ApolloServerExpressConfig } from 'apollo-server-express'
import {
  GraphQLFieldResolver,
  GraphQLObjectType,
  GraphQLSchemaConfig
} from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { FindOptions } from 'sequelize/types'
import {
  GlobalPreCallback,
  graphqlSchemaDeclarationType,
  modelDeclarationType,
  MutationList,
  OutputTypes,
  SequelizeModel,
  SequelizeModels,
  TInfo,
  Types
} from '../types'

export function generateApolloServer({
  graphqlSchemaDeclaration,
  customMutations,
  types,
  models,
  apolloServerOptions,
  pubSubInstance,
  globalPreCallback
}: {
  graphqlSchemaDeclaration: graphqlSchemaDeclarationType
  types: Types
  models: SequelizeModels
  customMutations?: MutationList
  apolloServerOptions?: ApolloServerExpressConfig
  pubSubInstance?: PubSub | null
  globalPreCallback?: GlobalPreCallback
}): ApolloServer
export function generateSchema({
  graphqlSchemaDeclaration,
  types,
  models,
  customMutations,
  globalPreCallback,
  pubSubInstance
}: {
  graphqlSchemaDeclaration: graphqlSchemaDeclarationType
  types: Types
  models: SequelizeModels
  customMutations: MutationList
  globalPreCallback?: GlobalPreCallback
  pubSubInstance: PubSub | null
}): GraphQLSchemaConfig
export function generateModelTypes(models: SequelizeModels): Types
export function generateCount(
  model: SequelizeModel,
  schemaDeclaration: modelDeclarationType,
  globalPreCallback: GlobalPreCallback
): GraphQLFieldResolver<any, any, any>
export function removeUnusedAttributes(
  findOptions: FindOptions,
  info: TInfo,
  currentModel: SequelizeModel,
  models: SequelizeModels,
  keep: Array<String>
): FindOptions
export function injectAssociations(
  modelGraphQLType: GraphQLObjectType,
  graphqlSchemaDeclaration: graphqlSchemaDeclarationType,
  outputTypes: OutputTypes,
  models: SequelizeModels,
  globalPreCallback: GlobalPreCallback,
  proxyModelName: string | null
): GraphQLObjectType
