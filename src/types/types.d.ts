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
  GroupedCountResultItem,
  Includeable,
  InferAttributes,
  Model,
  ModelStatic,
  Sequelize,
  WhereAttributeHash,
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

export type CustomResolver<TContext = any> = (
  source: any,
  args: TArgs,
  context: TContext,
  info: TInfo
) => Promise<any>

export type CustomMutationConfiguration<TContext = any> = {
  type: GraphQLObjectType | GraphQLList<GraphQLObjectType>
  description?: string
  args: EndpointArgs
  resolve: CustomResolver<TContext>
}

export type MutationList<TContext = any> = {
  [key: string]: CustomMutationConfiguration<TContext>
}

export type CustomSubscriptionConfiguration<TContext = any> = {
  type: GraphQLObjectType | GraphQLList<GraphQLObjectType>
  description?: string
  args: EndpointArgs
  subscribe: GraphQLFieldResolver<TSource, TContext, TArgs>
}

export type SubscriptionList<TContext = any> = {
  [key: string]: CustomSubscriptionConfiguration<TContext>
}

export type setWebhookDataType = (defaultData: any) => (f: Function) => void

export type GlobalBeforeHook<TContext = any> = (params: {
  args: TArgs
  context: TContext
  info: TInfo
}) => any | Promise<any>

export type QueryBeforeHook<M extends Model<any>, TContext = any> = (params: {
  findOptions: FindOptionsWithAttributesWhere<M>
  args: TArgs
  context: TContext
  info: TInfo
}) =>
  | FindOptionsWithAttributesWhere<M>
  | Promise<FindOptionsWithAttributesWhere<M>>

export type QueryAfterHook<M extends Model<any>, TContext = any> = (params: {
  result: M | M[]
  args: TArgs
  context: TContext
  info: TInfo
}) => M | M[] | Promise<M | M[]>

export type CountAfterHook<M extends Model<any>, TContext = any> = (params: {
  result: number | GroupedCountResultItem[]
  args: TArgs
  context: TContext
  info: TInfo
}) =>
  | Promise<number | GroupedCountResultItem[]>
  | number
  | GroupedCountResultItem[]

export type MutationBeforeHook<
  M extends Model<any>,
  TContext = any
> = (params: {
  source: any
  args: TArgs
  context: TContext
  info: TInfo
}) => any | Promise<any>

export type MutationAfterHook<M extends Model<any>, TContext = any> = (params: {
  createdEntity: M
  source: any
  args: TArgs
  context: TContext
  info: TInfo
  setWebhookData?: (callback: (defaultData: any) => any) => void
}) => M | Promise<M>

export type UpdateMutationAfterHook<
  M extends Model<any>,
  TContext = any
> = (params: {
  updatedEntity: M
  previousPropertiesSnapshot: Partial<InferAttributes<M>>
  source: any
  args: TArgs
  context: TContext
  info: TInfo
}) => M | Promise<M>

export type DeleteMutationBeforeHook<
  M extends Model<any>,
  TContext = any
> = (params: {
  where: Filterable<M>
  source: any
  args: TArgs
  context: TContext
  info: TInfo
}) => Filterable<M> | Promise<Filterable<M>>

export type DeleteMutationAfterHook<
  M extends Model<any>,
  TContext = any
> = (params: {
  deletedEntity: M
  source: any
  args: TArgs
  context: TContext
  info: TInfo
}) => M | Promise<M>

export type SubscriptionFilterHook<TContext = any> = (
  payload: any,
  args: TArgs,
  context: TContext,
  info: TInfo
) => boolean | Promise<boolean>

export type SubscriptionFilter = (params: {
  payload: any
  args: any
  context: any
}) => boolean

export type CreateFieldDeclarationType<M extends Model<any>, TContext = any> = {
  before?: CreateBeforeHook<M, TContext> | CreateBeforeHook<M, TContext>[]
  after?: CreateAfterHook<M, TContext> | CreateAfterHook<M, TContext>[]
  extraArg?: Record<string, { type: GraphQLInputType }>
  subscriptionFilter?: SubscriptionFilterHook<TContext>
  preventDuplicateOnAttributes?: string[]
}

export type GraphqlSchemaDeclarationType<TContext = any> = {
  [key: string]:
    | ModelDeclarationType<any, TContext>
    | GraphQLFieldConfig<any, any, any>
}

export type UpdateFieldDeclarationType<M extends Model<any>, TContext = any> = {
  before?: UpdateBeforeHook<M, TContext> | UpdateBeforeHook<M, TContext>[]
  after?: UpdateAfterHook<M, TContext> | UpdateAfterHook<M, TContext>[]
  extraArg?: Record<string, { type: GraphQLInputType }>
  subscriptionFilter?: SubscriptionFilterHook<TContext>
}

export type DeleteFieldDeclarationType<M extends Model<any>, TContext = any> = {
  before?: DeleteBeforeHook<M, TContext> | DeleteBeforeHook<M, TContext>[]
  after?: DeleteAfterHook<M, TContext> | DeleteAfterHook<M, TContext>[]
  extraArg?: Record<string, { type: GraphQLInputType }>
  subscriptionFilter?: SubscriptionFilterHook<TContext>
}

export type ListDeclarationType<M extends Model<any>, TContext = any> = {
  removeUnusedAttributes?: boolean
  enforceMaxLimit?: number
  before?: QueryBeforeHook<M, TContext> | QueryBeforeHook<M, TContext>[]
  after?: QueryAfterHook<M, TContext> | QueryAfterHook<M, TContext>[]
  resolver?: GraphQLFieldResolver<any, TContext>
  contextToOptions?: boolean
  extraArg?: Record<string, { type: GraphQLInputType }>
  disableOptimizationForLimitOffset?: boolean
  subscriptionFilter?: SubscriptionFilterHook<TContext>
}

export type ModelDeclarationType<M extends Model<any>, TContext = any> = {
  model: ModelStatic<M>
  actions?: Action[]
  subscriptions?: Event[]
  webhooks?: WebhookType[]
  before?: GlobalBeforeHook<TContext> | GlobalBeforeHook<TContext>[]
  count?: {
    extraArg?: Record<string, { type: GraphQLInputType }>
    before?: QueryBeforeHook<M, TContext> | QueryBeforeHook<M, TContext>[]
    after?: CountAfterHook<M, TContext> | CountAfterHook<M, TContext>[]
    resolver?: GraphQLFieldResolver<any, TContext>
  }
  list?: ListDeclarationType<M, TContext>
  create?:
    | CreateFieldDeclarationType<M, TContext>
    | GraphQLFieldConfig<TSource, TContext, TArgs>
  update?:
    | UpdateFieldDeclarationType<M, TContext>
    | GraphQLFieldConfig<TSource, TContext, TArgs>
  delete?:
    | DeleteFieldDeclarationType<M, TContext>
    | GraphQLFieldConfig<TSource, TContext, TArgs>
  excludeFields?: string[]
  excludeFromRoot?: boolean
  type?: GraphQLObjectType
  resolve?: GraphQLFieldResolver<any, TContext>
  args?: Record<string, { type: GraphQLInputType }>
  contextToOptions?: boolean
  additionalSubscriptions?: SubscriptionList<TContext>
  additionalMutations?: MutationList<TContext>
}

export type SequelizeModels = { [key: string]: ModelStatic<any> } & {
  sequelize: Sequelize
}

export type GlobalPreCallback = (name: string) => Function | null

export type Associations = { [key: string]: Association }

export type GraphqlSequelizeResolverConfigType<
  M extends Model,
  TContext = any
> = {
  before?: QueryBeforeHook<M, TContext>
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

export type CreateBeforeHook<M extends Model<any>, TContext = any> = (params: {
  source: any
  args: any
  context: TContext
  info: any
}) => Promise<any> | any

export type CreateAfterHook<M extends Model<any>, TContext = any> = (params: {
  createdEntity: M
  source: any
  args: any
  context: TContext
  info: any
  setWebhookData: (callback: (defaultData: any) => any) => void
}) => Promise<M> | M

export type UpdateBeforeHook<M extends Model<any>, TContext = any> = (params: {
  source: any
  args: any
  context: TContext
  info: any
}) => Promise<any> | any

export type UpdateAfterHook<M extends Model<any>, TContext = any> = (params: {
  updatedEntity: M
  previousPropertiesSnapshot: Partial<InferAttributes<M>>
  source: any
  args: any
  context: TContext
  info: any
}) => Promise<M> | M

export type DeleteBeforeHook<M extends Model<any>, TContext = any> = (params: {
  where: Filterable<M>
  source: any
  args: any
  context: TContext
  info: any
}) => Promise<Filterable<M>> | Filterable<M>

export type DeleteAfterHook<M extends Model<any>, TContext = any> = (params: {
  deletedEntity: M
  source: any
  args: any
  context: TContext
  info: any
}) => Promise<M> | M

// This type is made to ease the developer experience when using a GSG Hook.
// Having less configuration scenarios reduce the potential sources of bugs and improve readability.
export type FindOptionsWithAttributesWhere<M extends Model<any>> =
  FindOptions<any> & {
    // In the case of GraphQL, the where is an object with attributes
    // as functions can only be applied on attributes based on their alias.
    // Like { '$or' : {a: 1, b: 2} }
    where: WhereAttributeHash<M>
    // This should normally be either an Includeable or an array of Includeable[]
    // We force it as an array of Includeable[] to make it easier to work with.
    // This allow us to always initialize it and be able to use findOptions.include.push()
    // without having to check if it's an array or not.
    include: Includeable[]
  }
