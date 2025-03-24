import {
  GraphQLFieldConfig,
  GraphQLFieldResolver,
  GraphQLInputObjectType,
  GraphQLInputType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLType,
} from 'graphql'
import {
  Association,
  Filterable,
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

export type QueryBeforeHook<M extends Model<any>> = (params: {
  findOptions: FindOptions<M>
  args: TArgs
  context: TContext
  info: TInfo
}) => FindOptions<M> | Promise<FindOptions<M>>

export type QueryAfterHook<M extends Model<any>> = (params: {
  result: M | M[]
  args: TArgs
  context: TContext
  info: TInfo
}) => M | M[] | Promise<M | M[]>

export type MutationBeforeHook<M extends Model<any>> = (params: {
  source: any
  args: TArgs
  context: TContext
  info: TInfo
}) => any | Promise<any>

export type MutationAfterHook<M extends Model<any>> = (params: {
  newEntity: M
  source: any
  args: TArgs
  context: TContext
  info: TInfo
  setWebhookData?: (callback: (defaultData: any) => any) => void
}) => M | Promise<M>

export type UpdateMutationAfterHook<M extends Model<any>> = (params: {
  updatedEntity: M
  entitySnapshot: M
  source: any
  args: TArgs
  context: TContext
  info: TInfo
}) => M | Promise<M>

export type DeleteMutationBeforeHook<M extends Model<any>> = (params: {
  where: Filterable<M>
  source: any
  args: TArgs
  context: TContext
  info: TInfo
}) => Filterable<M> | Promise<Filterable<M>>

export type DeleteMutationAfterHook<M extends Model<any>> = (params: {
  deletedEntity: M
  source: any
  args: TArgs
  context: TContext
  info: TInfo
}) => M | Promise<M>

export type SubscriptionFilterHook = (params: {
  payload: any
  args: TArgs
  context: TContext
}) => boolean | Promise<boolean>

export type GraphqlSchemaDeclarationType = {
  [key: string]: ModelDeclarationType<any> | GraphQLFieldConfig<any, any, any>
}

export type CreateFieldDeclarationType<M extends Model<any>> = {
  extraArg?: Record<string, { type: GraphQLInputType }>
  before?: MutationBeforeHook<M>
  after?: MutationAfterHook<M>
  preventDuplicateOnAttributes?: string[]
  subscriptionFilter?: SubscriptionFilterHook
}

export type UpdateFieldDeclarationType<M extends Model<any>> = {
  extraArg?: Record<string, { type: GraphQLInputType }>
  before?: MutationBeforeHook<M>
  after?: UpdateMutationAfterHook<M>
  subscriptionFilter?: SubscriptionFilterHook
}

export type DeleteFieldDeclarationType<M extends Model<any>> = {
  extraArg?: Record<string, { type: GraphQLInputType }>
  before?: DeleteMutationBeforeHook<M>
  after?: DeleteMutationAfterHook<M>
  subscriptionFilter?: SubscriptionFilterHook
}

export type ListDeclarationType<M extends Model<any>> = {
  removeUnusedAttributes?: boolean
  enforceMaxLimit?: number
  before?: QueryBeforeHook<M>
  after?: QueryAfterHook<M>
  resolver?: Resolver
  subscriptionFilter?: SubscriptionFilterHook
  contextToOptions?: boolean
  extraArg?: Record<string, { type: GraphQLInputType }>
  disableOptimizationForLimitOffset?: boolean
}

export type ModelDeclarationType<M extends Model<any>> = {
  model: ModelStatic<M>
  actions?: Action[]
  subscriptions?: Event[]
  webhooks?: WebhookType[]
  before?: GlobalBeforeHook | GlobalBeforeHook[]
  count?: {
    extraArg?: Record<string, { type: GraphQLInputType }>
    before?: QueryBeforeHook<M>
    after?: QueryAfterHook<M>
    resolver?: Resolver
  }
  list?: ListDeclarationType<M>
  create?:
    | CreateFieldDeclarationType<M>
    | GraphQLFieldConfig<TSource, TContext, TArgs>
  update?:
    | UpdateFieldDeclarationType<M>
    | GraphQLFieldConfig<TSource, TContext, TArgs>
  delete?:
    | DeleteFieldDeclarationType<M>
    | GraphQLFieldConfig<TSource, TContext, TArgs>
  excludeFields?: string[]
  excludeFromRoot?: boolean
  type?: GraphQLObjectType
  resolve?: Resolver
  args?: Record<string, { type: GraphQLInputType }>
  contextToOptions?: boolean
  additionalSubscriptions?: SubscriptionList
  additionalMutations?: MutationList
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

export type Resolver = (
  source: any,
  args: any,
  context: any,
  info: any
) => any | Promise<any>
