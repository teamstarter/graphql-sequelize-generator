import {
  Model,
  Sequelize,
  BuildOptions,
  FindOptions,
  Association,
} from 'sequelize/types'
import {
  GraphQLScalarType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLType,
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLList,
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

export type InAndOutTypes = {
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
  type: GraphQLObjectType | GraphQLList<GraphQLObjectType>
  description?: string
  args: EndpointArgs
  resolve: CustomResolver
}

export type MutationList = {
  [key: string]: CustomMutationConfiguration
}

export type CustomSubscriptionConfiguration = {
  type: GraphQLObjectType | GraphQLList<GraphQLObjectType>
  description?: string
  args: EndpointArgs
  subscribe: GraphQLFieldResolver<TSource, TContext, TArgs>
}

export type SubscriptionList = {
  [key: string]: CustomSubscriptionConfiguration
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

export type GraphqlSchemaDeclarationType = {
  [key: string]: ModelDeclarationType | GraphQLFieldConfig<any, any, any>
}

export type ModelDeclarationType = {
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
    subscriptionFilter?: SubscriptionFilterHook
    preventDuplicateOnAttributes?: string[]
  }
  update?: {
    extraArg?: ExtraArg
    before?: MutationBeforeHook
    after?: UpdateAfterHook
    subscriptionFilter?: SubscriptionFilterHook
  }
  delete?: {
    before?: DeleteBeforeHook
    after?: DeleteAfterHook
    subscriptionFilter?: SubscriptionFilterHook
  }
  count?: {
    extraArg?: ExtraArg
    before?: QueryBeforeHook
    resolver?: GraphQLFieldResolver<TSource, TArgs, TContext>
  }
}

export type SequelizeModels = { [key: string]: SequelizeModel } & {
  sequelize: Sequelize
}

export type GlobalPreCallback = (name: string) => Function | null

export type Associations = { [key: string]: Association }
