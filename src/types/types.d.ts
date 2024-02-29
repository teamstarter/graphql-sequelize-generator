import {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
} from 'graphql'
import {
  Association,
  BuildOptions,
  FindOptions as FO,
  Includeable,
  Model,
  Sequelize,
} from 'sequelize/types'

// graphql-sequelize does not have typescript support. So we have to reproduce what it is based on
// the sequelize implementation.
export type FindOptions = Omit<FO, 'include'> & { include: Includeable[] }

export type Action = 'list' | 'create' | 'delete' | 'update' | 'count'
export type ActionList = Array<Action>

export type Event = 'create' | 'delete' | 'update'
export type EventList = Array<Event>

export type SequelizeModel<M extends Model> = typeof Model<M> & {
  new (values?: M, options?: BuildOptions): any
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

export type ListResult<M extends SequelizeModel<any>> = M[] | M

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
  context: TContext,
  info: TInfo
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

export type setWebhookDataType = (defaultData: any) => (f: Function) => void

export type GlobalBeforeHook = (
  args: TArgs,
  context: TContext,
  info: TInfo
) => any | Promise<any>
export type QueryBeforeHook = (
  findOptions: FindOptions,
  args: TArgs,
  context: TContext,
  info: TInfo
) => FindOptions | Promise<FindOptions>

export type ListAfterHook<M extends SequelizeModel<any>> = (
  result: ListResult<M>,
  args: TArgs,
  context: TContext,
  info: TInfo
) => ListResult<M> | Promise<ListResult<M>>

export type MutationBeforeHook = (
  findOptions: FindOptions,
  args: TArgs,
  context: TContext,
  info: TInfo
) => EntityProperties | Promise<EntityProperties>
export type CreateAfterHook = (
  newEntity: any,
  source: any,
  args: TArgs,
  context: TContext,
  info: TInfo,
  setWebhookData: setWebhookDataType
) => any | Promise<any>
export type UpdateAfterHook = (
  newEntity: any,
  entitySnapshotBeforeUpdate: any,
  source: any,
  args: TArgs,
  context: TContext,
  info: TInfo
) => any | Promise<any>
export type DeleteBeforeHook = (
  where: Where,
  findOptions: FindOptions,
  args: TArgs,
  context: TContext,
  info: TInfo
) => Where | Promise<Where>
export type DeleteAfterHook = (
  oldEntitySnapshot: any,
  source: any,
  args: TArgs,
  context: TContext,
  info: TInfo
) => any | Promise<any>

export type SubscriptionFilterHook = (
  payload: Payload,
  args: TArgs,
  context: TContext
) => boolean | Promise<boolean>

export type GraphqlSchemaDeclarationType = {
  [key: string]: ModelDeclarationType<any> | GraphQLFieldConfig<any, any, any>
}

export type CreateFieldDeclarationType = {
  extraArg?: ExtraArg
  before?: MutationBeforeHook
  after?: CreateAfterHook
  subscriptionFilter?: SubscriptionFilterHook
  preventDuplicateOnAttributes?: string[]
}

export type UpdateFieldDeclarationType = {
  extraArg?: ExtraArg
  before?: MutationBeforeHook
  after?: UpdateAfterHook
  subscriptionFilter?: SubscriptionFilterHook
}

export type DeleteFieldDeclarationType = {
  before?: DeleteBeforeHook
  after?: DeleteAfterHook
  subscriptionFilter?: SubscriptionFilterHook
}

export type ListDeclarationType<M extends SequelizeModel<any>> = {
  removeUnusedAttributes?: boolean
  extraArg?: ExtraArg
  before?: QueryBeforeHook
  after?: ListAfterHook<M>
  resolver?: GraphQLFieldResolver<TSource, TArgs, TContext>
  enforceMaxLimit?: number
  contextToOptions?: boolean
  subscriptionFilter?: SubscriptionFilterHook
}

export type ModelDeclarationType<M extends SequelizeModel<any>> = {
  model: M
  actions?: ActionList
  subscriptions?: EventList
  additionalMutations?: MutationList
  additionalSubscriptions?: SubscriptionList
  excludeFromRoot?: boolean
  excludeFields?: string[]
  before?: GlobalBeforeHook[] | GlobalBeforeHook
  list?: ListDeclarationType<M>
  count?: {
    extraArg?: ExtraArg
    before?: QueryBeforeHook
    resolver?: GraphQLFieldResolver<TSource, TArgs, TContext>
  }
  create?:
    | CreateFieldDeclarationType
    | GraphQLFieldConfig<TSource, TContext, TArgs>
  update?:
    | UpdateFieldDeclarationType
    | GraphQLFieldConfig<TSource, TContext, TArgs>
  delete?:
    | DeleteFieldDeclarationType
    | GraphQLFieldConfig<TSource, TContext, TArgs>
}

export type SequelizeModels = { [key: string]: SequelizeModel<any> } & {
  sequelize: Sequelize
}

export type GlobalPreCallback = (name: string) => Function | null

export type Associations = { [key: string]: Association }

export type GraphqlSequelizeResolverConfigType = {
  before?: QueryBeforeHook
}

export interface GraphqlSequelizeResolverType {
  (model: SequelizeModel<any>, config: GraphqlSequelizeResolverConfigType):
    | any
    | Promise<any>
  contextToOptions: any
}
