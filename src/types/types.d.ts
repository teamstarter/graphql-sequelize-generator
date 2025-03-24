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
  FindOptions,
  Model,
  ModelStatic,
  Sequelize,
} from 'sequelize/types'

export type Action = 'list' | 'create' | 'delete' | 'update' | 'count'
export type ActionList = Array<Action>

export type Event = 'create' | 'delete' | 'update'
export type EventList = Array<Event>
export type WebhookType = 'create' | 'update' | 'delete'
export type WebhookTypeList = Array<WebhookType>

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

export type ListResult<M extends Model<any>> = M[] | M

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

export type GlobalBeforeHook = (params: {
  args: TArgs
  context: TContext
  info: TInfo
}) => any | Promise<any>

export type QueryBeforeHook<M extends Model<any>> = (
  findOptions: FindOptions<M>,
  args: TArgs,
  context: TContext,
  info: TInfo
) => FindOptions<M> | Promise<FindOptions<M>>

export type ListAfterHook<M extends Model<any>> = (
  result: ListResult<M>,
  args: TArgs,
  context: TContext,
  info: TInfo
) => ListResult<M> | Promise<ListResult<M>>

export type MutationBeforeHook<M extends Model> = (
  findOptions: FindOptions<M>,
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
  webhookData: (f: Function) => void
) => any | Promise<any>
export type UpdateAfterHook<M extends Model> = (
  newEntity: M,
  entitySnapshotBeforeUpdate: any,
  source: any,
  args: TArgs,
  context: TContext,
  info: TInfo,
  webhookData: (f: Function) => void
) => any | Promise<any>
export type DeleteBeforeHook<M extends Model> = (
  where: Where,
  findOptions: FindOptions<M>,
  args: TArgs,
  context: TContext,
  info: TInfo
) => Where | Promise<Where>
export type DeleteAfterHook<M extends Model<M>> = (
  oldEntitySnapshot: M,
  source: any,
  args: TArgs,
  context: TContext,
  info: TInfo,
  webhookData: (f: Function) => void
) => any | Promise<any>

export type SubscriptionFilterHook = (
  payload: Payload,
  args: TArgs,
  context: TContext
) => boolean | Promise<boolean>

export type GraphqlSchemaDeclarationType = {
  [key: string]: ModelDeclarationType<any> | GraphQLFieldConfig<any, any, any>
}

export type CreateFieldDeclarationType<M extends Model> = {
  extraArg?: ExtraArg
  before?: MutationBeforeHook<M>
  after?: CreateAfterHook
  subscriptionFilter?: SubscriptionFilterHook
  preventDuplicateOnAttributes?: string[]
}

export type UpdateFieldDeclarationType<M extends Model> = {
  extraArg?: ExtraArg
  before?: MutationBeforeHook<M>
  after?: UpdateAfterHook<M>
  subscriptionFilter?: SubscriptionFilterHook
}

export type DeleteFieldDeclarationType<M extends Model<M>> = {
  extraArg?: ExtraArg
  before?: DeleteBeforeHook<M>
  after?: DeleteAfterHook<M>
  subscriptionFilter?: SubscriptionFilterHook
}

export type ListDeclarationType<M extends Model<any>> = {
  removeUnusedAttributes?: boolean
  disableOptimizationForLimitOffset?: boolean
  extraArg?: ExtraArg
  before?: QueryBeforeHook<M>
  after?: ListAfterHook<M>
  resolver?: GraphQLFieldResolver<TSource, TArgs, TContext>
  enforceMaxLimit?: number
  contextToOptions?: boolean
}

export type ModelDeclarationType<M extends Model> = {
  model: ModelStatic<M>
  actions?: ActionList
  subscriptions?: EventList
  webhooks?: WebhookTypeList
  additionalMutations?: MutationList
  additionalSubscriptions?: SubscriptionList
  excludeFromRoot?: boolean
  excludeFields?: string[]
  before?: GlobalBeforeHook[] | GlobalBeforeHook
  list?: ListDeclarationType<M>
  count?: {
    extraArg?: ExtraArg
    before?: QueryBeforeHook<M>
    resolver?: GraphQLFieldResolver<TSource, TArgs, TContext>
  }
  create?:
    | CreateFieldDeclarationType<M>
    | GraphQLFieldConfig<TSource, TContext, TArgs>
  update?:
    | UpdateFieldDeclarationType<M>
    | GraphQLFieldConfig<TSource, TContext, TArgs>
  delete?:
    | DeleteFieldDeclarationType<M>
    | GraphQLFieldConfig<TSource, TContext, TArgs>
}

export type SequelizeModels = { [key: string]: ModelStatic<any> } & {
  sequelize: Sequelize
}

export type GlobalPreCallback = (name: string) => Function | null

export type Associations = { [key: string]: Association }

export type GraphqlSequelizeResolverConfigType<M extends Model> = {
  before?: QueryBeforeHook<M>
}

export interface GraphqlSequelizeResolverType {
  (model: ModelStatic<any>, config: GraphqlSequelizeResolverConfigType<any>):
    | any
    | Promise<any>
  contextToOptions: any
}
