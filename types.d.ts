import { Model, Sequelize, BuildOptions, FindOptions } from 'sequelize/types'
import {
  GraphQLScalarType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLType,
  GraphQLFieldConfig,
  GraphQLFieldResolver
} from 'graphql'

export type Action = 'list' | 'create' | 'delete' | 'update' | 'count'
export type ActionList = Array<Action>

export type Event = 'create' | 'delete' | 'update'
export type EventList = Array<Event>

export type SequelizeModel = typeof Model & {
  new (values?: object, options?: BuildOptions): any
}

export type ExtraArg = { [key: string]: { type: GraphQLType } }

export type TSource = any
export type TArgs = { [key: string]: any }
export type TContext = any
export type TInfo = any

export type Payload = any

export type Types = {
  inputTypes: InputTypes
  outputTypes: OutputTypes
}

export type EntityProperties = any

export type ListResult = any[]

export type Where = any

export type OutputTypes = {
  [key: string]: GraphQLObjectType
}

export type InputTypes = {
  [key: string]: GraphQLInputObjectType
}

export type EnpointArg = {
  type: GraphQLScalarType | GraphQLNonNull<any>
}
export type EndpointArgs = {
  [key: string]: EnpointArg
}

export type CustomResolver = (
  source: any,
  args: TArgs,
  context: TContext
) => Promise<any>

export type CustomMutationConfiguration = {
  type: GraphQLObjectType
  description?: string
  args: EndpointArgs
  resolve: CustomResolver
}

export type MutationList = {
  [key: string]: CustomMutationConfiguration
}

export type CustomSubscriptionConfiguration = {
  type: GraphQLObjectType
  description?: string
  args: EndpointArgs
  subcribe: GraphQLFieldResolver<TSource, TContext, TArgs>
}

export type SubscriptionList = {
  [key: string]: CustomMutationConfiguration
}

export type GlobalBeforeHook = (
  args: TArgs,
  context: TContext,
  info: TInfo
) => void
export type QueryBeforeHook = (
  findOptions: FindOptions,
  args: TArgs,
  context: TContext,
  info: TInfo
) => FindOptions
export type ListAfterHook = (
  result: ListResult,
  args: TArgs,
  context: TContext,
  info: TInfo
) => ListResult
export type MutationBeforeHook = (
  findOptions: FindOptions,
  args: TArgs,
  context: TContext,
  info: TInfo
) => EntityProperties
export type CreateAfterHook = (
  newEntity: any,
  source: any,
  args: TArgs,
  context: TContext,
  info: TInfo
) => any
export type UpdateAfterHook = (
  newEntity: any,
  entitySnapshotBeforeUpdate: any,
  source: any,
  args: TArgs,
  context: TContext,
  info: TInfo
) => any
export type DeleteBeforeHook = (
  where: Where,
  findOptions: FindOptions,
  args: TArgs,
  context: TContext,
  info: TInfo
) => Where
export type DeleteAfterHook = (
  oldEntitySnapshot: any,
  source: any,
  args: TArgs,
  context: TContext,
  info: TInfo
) => any

export type SubscriptionFilterHook = (
  payload: Payload,
  args: TArgs,
  context: TContext
) => boolean

export type preventDuplicateOnAttributesHook = () => string[]

export type graphqlSchemaDeclarationType = {
  [key: string]: modelDeclarationType | GraphQLFieldConfig<any, any, any>
}

export type modelDeclarationType = {
  model: SequelizeModel
  actions?: ActionList
  subscriptions?: EventList
  additionalMutations?: MutationList
  additionalSubscriptions?: SubscriptionList
  excludeFromRoot?: boolean
  excludeFields?: string[]
  before?: GlobalBeforeHook[]
  list?: {
    removeUnusedAttributes?: boolean
    extraArg?: ExtraArg
    before?: QueryBeforeHook
    after?: ListAfterHook
    resolver?: GraphQLFieldResolver<TSource, TArgs, TContext>
  }
  create?: {
    extraArg?: ExtraArg
    before?: MutationBeforeHook
    after?: CreateAfterHook
    subscriptionFilter: SubscriptionFilterHook
  }
  update?: {
    extraArg?: ExtraArg
    before?: MutationBeforeHook
    after?: UpdateAfterHook
    subscriptionFilter: SubscriptionFilterHook
    preventDuplicateOnAttributes?: preventDuplicateOnAttributesHook
  }
  delete?: {
    extraArg?: ExtraArg
    before?: DeleteBeforeHook
    after?: DeleteAfterHook
    subscriptionFilter: SubscriptionFilterHook
  }
  count?: {
    extraArg?: ExtraArg
    before?: QueryBeforeHook
    resolver?: GraphQLFieldResolver<TSource, TArgs, TContext>
  }
}

export type SequelizeModels = { [key: string]: SequelizeModel }

export type GlobalPreCallback = (name: string) => Function | null
