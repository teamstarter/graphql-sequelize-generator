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
  GraphqlSchemaDeclarationType,
  ModelDeclarationType,
  MutationList,
  OutputTypes,
  SequelizeModel,
  SequelizeModels,
  TInfo,
  InAndOutTypes
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
  graphqlSchemaDeclaration: GraphqlSchemaDeclarationType
  types: InAndOutTypes
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
  graphqlSchemaDeclaration: GraphqlSchemaDeclarationType
  types: InAndOutTypes
  models: SequelizeModels
  customMutations: MutationList
  globalPreCallback?: GlobalPreCallback
  pubSubInstance: PubSub | null
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
