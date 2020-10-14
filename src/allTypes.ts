import { Model, Sequelize, BuildOptions } from 'sequelize/types'
import {
  GraphQLScalarType,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLInputObjectType
} from 'graphql'

export type Action = 'list' | 'create' | 'delete' | 'update' | 'count'
export type ActionList = Array<Action>

export type Subscription = 'create' | 'delete' | 'update'
export type SubscriptionList = Array<Subscription>

export type SequelizeModel = typeof Model & {
  new (values?: object, options?: BuildOptions): any
}

export type Args = any

export type Context = any

export type Types = {
  inputTypes: InputTypes
  outputTypes: OutputTypes
}

export type Info = any

export type EntityProperties = any

export type Where = any

export type FindOptions = any

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
  args: Args,
  context: Context
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

export type GlobalBeforeHook = (
  args: Args,
  context: Context,
  info: Info
) => void
export type QueryBeforeHook = (
  findOptions: FindOptions,
  args: Args,
  context: Context,
  info: Info
) => FindOptions
export type MutationBeforeHook = (
  findOptions: FindOptions,
  args: Args,
  context: Context,
  info: Info
) => EntityProperties
export type CreateAfterHook = (
  newEntity: any,
  source: any,
  args: Args,
  context: Context,
  info: Info
) => any
export type UpdateAfterHook = (
  newEntity: any,
  entitySnapshotBeforeUpdate: any,
  source: any,
  args: Args,
  context: Context,
  info: Info
) => any
export type DeleteBeforeHook = (
  where: Where,
  findOptions: FindOptions,
  args: Args,
  context: Context,
  info: Info
) => Where
export type DeleteAfterHook = (
  oldEntitySnapshot: any,
  source: any,
  args: Args,
  context: Context,
  info: Info
) => any

export type graphqlSchemaDeclarationType = {
  [key: string]: modelDeclarationType
}

export type modelDeclarationType = {
  model: SequelizeModel
  actions?: ActionList
  subscriptions?: SubscriptionList
  additionalMutations?: MutationList
  excludeFromRoot?: boolean
  excludeFields?: string[]
  before?: GlobalBeforeHook[]
  list?: {
    before?: QueryBeforeHook
  }
  create?: {
    before?: MutationBeforeHook
    after?: CreateAfterHook
  }
  update?: {
    before?: MutationBeforeHook
    after?: UpdateAfterHook
  }
  delete?: {
    before?: DeleteBeforeHook
    after?: DeleteAfterHook
  }
  count?: {
    before?: QueryBeforeHook
    resolver?: () => Promise<any>
  }
}

export type SequelizeModels = { [key: string]: SequelizeModel }

export type GlobalPreCallback = (name: string) => Function | null
