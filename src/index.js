const {
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema
} = require('graphql')
const {
  attributeFields,
  defaultArgs,
  defaultListArgs,
  resolver,
  simplifyAST
} = require('graphql-sequelize')
const Sequelize = require('sequelize')
const { argsToFindOptions } = require('graphql-sequelize')
const { PubSub, withFilter } = require('graphql-subscriptions')
const { createContext, EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize')
const { graphqlExpress } = require('apollo-server-express')

const pubSubInstance = new PubSub()

// Tell `graphql-sequelize` where to find the DataLoader context in the
// global request context
resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY }

/**
 * Returns the association fields of an entity.
 *
 * It iterates over all the associations and produces an object compatible with GraphQL-js.
 * BelongsToMany and HasMany associations are represented as a `GraphQLList` whereas a BelongTo
 * is simply an instance of a type.
 * @param {*} associations A collection of sequelize associations
 * @param {*} types Existing `GraphQLObjectType` types, created from all the Sequelize models
 */
const generateAssociationsFields = (associations, types) => {
  const fields = {}
  for (let associationName in associations) {
    fields[associationName] = generateAssociationField(
      associations[associationName],
      types
    )
  }
  return fields
}

/**
 *
 * @param {*} findOptions
 * @param {*} info
 * @param {Array<string>} keep An array of all the attributes to keep
 */
const removeUnusedAttributes = (findOptions, info, keep = []) => {
  const { fieldNodes } = info
  if (!fieldNodes) {
    return findOptions
  }
  const ast = simplifyAST(fieldNodes[0], info)

  const attributes = Object.keys(ast.fields).filter(
    attribute =>
      attribute !== '__typename' &&
      Object.keys(ast.fields[attribute].fields).length === 0
  )

  return { ...findOptions, attributes: [...new Set([...attributes, ...keep])] }
}

const generateAssociationField = (relation, types, resolver = null) => {
  const type =
    relation.associationType === 'BelongsToMany' ||
    relation.associationType === 'HasMany'
      ? new GraphQLList(types[relation.target.name])
      : types[relation.target.name]

  let field = {
    type,
    args: {
      // An arg with the key order will automatically be converted to a order on the target
      order: {
        type: GraphQLString
      }
    }
  }

  if (relation.associationType === 'HasMany') {
    // Limit and offset will only work for HasMany relation ship
    // Having the limit on the include will tigger a "Only HasMany associations support include.separate" error.
    // While sequelize N:M associations are not supported with hasMany. So BelongsToMany relationships
    // cannot be limited in a subquery. If you want to query them, make a custom resolver, or create a view.

    field.args.limit = {
      type: GraphQLInt
    }
    field.args.offset = {
      type: GraphQLInt
    }
  }

  if (resolver) {
    field.resolve = resolver
  }

  return field
}

/**
 * Returns a new `GraphQLObjectType` created from a sequelize model.
 *
 * It creates a `GraphQLObjectType` object with a name and fields. The
 * fields are generated from its sequelize associations.
 * @param {*} model The sequelize model used to create the `GraphQLObjectType`
 * @param {*} types Existing `GraphQLObjectType` types, created from all the Sequelize models
 */
const generateGraphQLType = (model, types, isInput = false) => {
  const GraphQLClass = isInput ? GraphQLInputObjectType : GraphQLObjectType
  return new GraphQLClass({
    name: isInput ? `${model.name}Input` : model.name,
    fields: () => ({
      ...attributeFields(model, {
        allowNull: !!isInput
      }),
      ...(isInput
        ? generateAssociationsFields(model.associations, types, isInput)
        : {})
    })
  })
}

/**
 * Returns a collection of `GraphQLObjectType` generated from Sequelize models.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the types
 */
// This function is exported
const generateModelTypes = models => {
  let outputTypes = {}
  let inputTypes = {}
  for (let modelName in models) {
    const model = models[modelName]
    // Only our models, not Sequelize nor sequelize
    if (model.hasOwnProperty('name') && modelName !== 'Sequelize') {
      outputTypes[modelName] = generateGraphQLType(model, outputTypes)
      inputTypes[modelName] = generateGraphQLType(model, inputTypes, true)
    }
  }
  return { outputTypes, inputTypes }
}

const countResolver = (model, { before }) => {
  return async (source, args, context, info) => {
    if (typeof before !== 'undefined') {
      const countOptions = await before(
        argsToFindOptions.default(args, Object.keys(model.rawAttributes)),
        args,
        context,
        info
      )
      return model.count(countOptions)
    }
    return model.count(
      argsToFindOptions.default(args, Object.keys(model.rawAttributes))
    )
  }
}

const allowOrderOnAssociations = (findOptions, args, context, info, model) => {
  if (typeof findOptions.order === 'undefined') {
    return findOptions
  }

  const checkForAssociationSort = singleOrder => {
    // When the comas is used, graphql-sequelize will not handle the 'reverse:' command.
    // We have to implement it ourselves.
    let field = null
    // By default we take the direction detected by GraphQL-sequelize
    // It will be 'ASC' if 'reverse:' was not specified.
    let direction = findOptions.order[0][1]
    // When reverse is not already removed by graphql-sequelize
    // we try to detect it ourselves. Happens for multiple fields sort.
    if (singleOrder.search('reverse:') === 0) {
      field = singleOrder.slice(8)
      direction = 'DESC'
    } else {
      field = singleOrder
    }

    // if there is exactly one dot, we check for associations
    const parts = field.split('.')
    if (parts.length === 2) {
      const associationName = parts[0]
      if (typeof model.associations[associationName] === 'undefined') {
        throw new Error(
          `Association ${associationName} unknown on model ${model.name} order`
        )
      }
      if (typeof findOptions.include === 'undefined') {
        findOptions.include = []
      }
      findOptions.include.push({
        model: model.associations[associationName].target
      })
      processedOrder.push([
        model.associations[associationName].target,
        parts[1],
        direction
      ])
    } else {
      // Virtual field must be sorted using quotes
      // as they are not real fields.
      if (
        model.attributes[field] &&
        model.attributes[field].type.key === 'VIRTUAL'
      ) {
        // model.attributes[field].fieldName is used to avoid code-injection.
        field = Sequelize.literal(`\`${model.attributes[field].fieldName}\``)
      }
      processedOrder.push([field, direction])
    }
  }

  /**
   * The sorting in sequelize can be represented in multiple forms:
   * order = ['id', 'DESC']
   * order = [['id', 'DESC'], ['fullname', 'ASC']]
   * order = [[models.user, 'id', 'DESC']]
   *
   * This part tries to add a multiple-sort feature to what is already
   * parsed by graphql-sequelize.
   *
   * order = ['id,reverse:fullname', 'ASC']
   * to
   * order = [['id', 'ASC'], ['fullname', 'DESC']
   */
  let processedOrder = []
  findOptions.order.map(order => {
    // Handle multiple sort fields.
    if (order[0].search(',') === -1) {
      checkForAssociationSort(order[0])
      return
    }
    const multipleOrder = order[0].split(',')
    for (const singleOrder of multipleOrder) {
      checkForAssociationSort(singleOrder)
    }
  })
  findOptions.order = processedOrder
  return findOptions
}

const argsAdvancedProcessing = (
  findOptions,
  args,
  context,
  info,
  listBefore,
  model,
  models
) => {
  findOptions = allowOrderOnAssociations(
    findOptions,
    args,
    context,
    info,
    model
  )

  // When an association uses a scope, we have to add it to the where condition by default.
  if (
    info.parentType &&
    models[info.parentType.name] &&
    models[info.parentType.name].associations[info.fieldName].scope
  ) {
    findOptions.where = {
      ...(findOptions.where ? findOptions.where : {}),
      ...models[info.parentType.name].associations[info.fieldName].scope
    }
  }

  if (listBefore) {
    return listBefore(findOptions, args, context, info)
  }
  return findOptions
}

const createResolver = (graphqlTypeDeclaration, models, relation = null) => {
  if (
    graphqlTypeDeclaration &&
    graphqlTypeDeclaration.list &&
    graphqlTypeDeclaration.list.resolver
  ) {
    return graphqlTypeDeclaration.list.resolver
  }

  const listBefore =
    graphqlTypeDeclaration.list && graphqlTypeDeclaration.list.before
      ? graphqlTypeDeclaration.list.before
      : undefined
  return resolver(relation || graphqlTypeDeclaration.model, {
    before: (findOptions, args, context, info) =>
      argsAdvancedProcessing(
        findOptions,
        args,
        context,
        info,
        listBefore,
        graphqlTypeDeclaration.model,
        models
      )
  })
}

const injectAssociations = (
  modelType,
  graphqlSchemaDeclaration,
  outputTypes,
  models,
  proxyModelName = null
) => {
  const modelName = proxyModelName || modelType.name
  const associations = models[modelName].associations
  if (Object.keys(associations).length === 0) {
    return modelType
  }
  const associationsFields = {}
  for (let associationName in associations) {
    associationsFields[associationName] = generateAssociationField(
      associations[associationName],
      outputTypes,
      createResolver(
        graphqlSchemaDeclaration[associations[associationName].target.name],
        models,
        associations[associationName]
      )
    )
  }
  // We have to mutate the original field, as type names must be unique
  // We cannot return a new type as the type may have already been used
  // In previous models.
  const oldFields = { ...modelType._typeConfig.fields }
  let baseFields = {}
  if (typeof graphqlSchemaDeclaration[modelName] !== 'undefined') {
    baseFields = attributeFields(graphqlSchemaDeclaration[modelName].model, {
      allowNull: false,
      exclude: graphqlSchemaDeclaration[modelName].excludeFields
    })
  }
  // return
  modelType._typeConfig.fields = {
    ...oldFields,
    ...baseFields,
    ...associationsFields
  }

  return modelType
}

/**
 * Returns a root `GraphQLObjectType` used as query for `GraphQLSchema`.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the root `GraphQLSchema`
 */
const generateQueryRootType = (
  graphqlSchemaDeclaration,
  outputTypes,
  models
) => {
  return new GraphQLObjectType({
    name: 'Root_Query',
    fields: Object.keys(outputTypes).reduce((fields, modelTypeName) => {
      const modelType = outputTypes[modelTypeName]
      const dec = graphqlSchemaDeclaration[modelType.name]
      if (typeof dec === 'undefined') {
        throw new Error(`The model type ${modelType.name} is not defined`)
      }

      const listBefore =
        dec.list && dec.list.before ? dec.list.before : undefined

      const ApiFields = {
        ...fields,
        [modelType.name]: {
          type: new GraphQLList(
            injectAssociations(
              modelType,
              graphqlSchemaDeclaration,
              outputTypes,
              models
            )
          ),
          args: {
            ...defaultArgs(dec.model),
            ...defaultListArgs(),
            ...(dec.list && dec.list.extraArg ? dec.list.extraArg : {})
          },
          resolve: createResolver(dec, models)
        }
      }

      // Count uses the same before function as the list, except if specified otherwise
      const countBefore =
        dec.count && dec.count.before ? dec.before : listBefore

      // @todo counts should only be added if configured in the schema declaration
      return {
        ...ApiFields,
        [`${modelType.name}Count`]: {
          type: GraphQLInt,
          args: { ...defaultArgs(dec.model), ...defaultListArgs() },
          resolve: countResolver(dec.model, {
            before: countBefore
          })
        }
      }
    }, {})
  })
}
/**
 * Generates a create mutation operation
 *
 * @param {*} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} model
 */
const _generateMutationCreate = (
  modelName,
  inputType,
  outputType,
  model,
  graphqlModelDeclaration
) => ({
  type: outputType, // what is returned by resolve, must be of type GraphQLObjectType
  description: 'Create a ' + modelName,
  args: {
    [modelName]: { type: new GraphQLNonNull(inputType) },
    ...(graphqlModelDeclaration.create &&
    graphqlModelDeclaration.create.extraArg
      ? graphqlModelDeclaration.create.extraArg
      : {})
  },
  resolve: async (source, args, context, info) => {
    let object = args[modelName]
    if (
      graphqlModelDeclaration.create &&
      graphqlModelDeclaration.create.before
    ) {
      object = await graphqlModelDeclaration.create.before(
        source,
        args,
        context,
        info
      )
    }
    const newObject = await model.create(object)

    if (
      graphqlModelDeclaration.create &&
      graphqlModelDeclaration.create.after
    ) {
      return graphqlModelDeclaration.create.after(
        newObject,
        source,
        args,
        context,
        info
      )
    }
    return newObject
  }
})

/**
 * Generates a update mutation operation
 *
 * @param {*} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} model
 */
const _generateMutationUpdate = (
  modelName,
  inputType,
  outputType,
  model,
  graphqlModelDeclaration,
  models
) => ({
  type: outputType,
  description: 'Update a ' + modelName,
  args: {
    [modelName]: { type: new GraphQLNonNull(inputType) },
    ...(graphqlModelDeclaration.update &&
    graphqlModelDeclaration.update.extraArg
      ? graphqlModelDeclaration.update.extraArg
      : {})
  },
  resolve: async (source, args, context, info) => {
    let data = args[modelName]
    if (
      graphqlModelDeclaration.update &&
      graphqlModelDeclaration.update.before
    ) {
      data = await graphqlModelDeclaration.update.before(
        source,
        args,
        context,
        info
      )
    }

    const object = await models[modelName].findOne({ where: { id: data.id } })

    if (!object) {
      throw new Error(`${modelName} not found.`)
    }

    const snapshotBeforeUpdate = { ...object.get({ plain: true }) }
    await object.update(data)
    await object.reload()

    if (
      graphqlModelDeclaration.update &&
      graphqlModelDeclaration.update.after
    ) {
      return graphqlModelDeclaration.update.after(
        object,
        snapshotBeforeUpdate,
        source,
        args,
        context,
        info
      )
    }
    return object
  }
})

/**
 * Generates a delete mutation operation
 *
 * @param {*} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} model
 */
const _generateMutationDelete = (
  modelName,
  inputType,
  outputType,
  graphqlModelDeclaration,
  models
) => ({
  type: GraphQLInt,
  description: 'Delete a ' + modelName,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) }
  },
  resolve: async (source, args, context, info) => {
    let where = { id: args.id }
    if (
      graphqlModelDeclaration.delete &&
      graphqlModelDeclaration.delete.before
    ) {
      where = await graphqlModelDeclaration.delete.before(
        where,
        source,
        args,
        context,
        info
      )
    }

    const entity = await models[modelName].findOne({ where })

    if (!entity) {
      throw new Error(`${modelName} not found.`)
    }

    const rowDeleted = await graphqlModelDeclaration.model.destroy({
      where
    }) // Returns the number of rows affected (0 or 1)

    if (
      graphqlModelDeclaration.delete &&
      graphqlModelDeclaration.delete.after
    ) {
      await graphqlModelDeclaration.delete.after(
        entity,
        source,
        args,
        context,
        info
      )
    }
    return rowDeleted
  }
})

const generateMutationRootType = (
  graphqlSchemaDeclaration,
  inputTypes,
  outputTypes,
  models
) => {
  const fields = Object.keys(inputTypes).reduce((mutations, modelName) => {
    const inputType = inputTypes[modelName]
    const outputType = outputTypes[modelName]
    const model = graphqlSchemaDeclaration[modelName].model
    const actions = graphqlSchemaDeclaration[modelName].actions || [
      'create',
      'update',
      'delete'
    ]

    if (actions.includes('create')) {
      mutations[modelName + 'Create'] =
        graphqlSchemaDeclaration[modelName].create &&
        graphqlSchemaDeclaration[modelName].create.resolve
          ? graphqlSchemaDeclaration[modelName].create
          : _generateMutationCreate(
            modelName,
            inputType,
            outputType,
            model,
            graphqlSchemaDeclaration[modelName]
          )
    }
    if (actions.includes('update')) {
      mutations[modelName + 'Update'] =
        graphqlSchemaDeclaration[modelName].update &&
        graphqlSchemaDeclaration[modelName].update.resolve
          ? graphqlSchemaDeclaration[modelName].update
          : _generateMutationUpdate(
            modelName,
            inputType,
            outputType,
            model,
            graphqlSchemaDeclaration[modelName],
            models
          )
    }
    if (actions.includes('delete')) {
      mutations[modelName + 'Delete'] =
        graphqlSchemaDeclaration[modelName].delete &&
        graphqlSchemaDeclaration[modelName].delete.resolve
          ? graphqlSchemaDeclaration[modelName].delete
          : _generateMutationDelete(
            modelName,
            inputType,
            outputType,
            graphqlSchemaDeclaration[modelName],
            models
          )
    }

    if (graphqlSchemaDeclaration[modelName].additionalMutations) {
      Object.keys(graphqlSchemaDeclaration[modelName].additionalMutations).map(
        key =>
          (mutations[key] =
            graphqlSchemaDeclaration[modelName].additionalMutations[key])
      )
    }

    return mutations
  }, {})

  return new GraphQLObjectType({
    name: 'Root_Mutations',
    fields
  })
}

const generateSubscriptions = (graphqlSchemaDeclaration, types) => {
  const fields = Object.keys(types.inputTypes).reduce(
    (subscriptions, modelName) => {
      const outputType = types.outputTypes[modelName]
      const actions = graphqlSchemaDeclaration[modelName].actions || [
        'create',
        'update',
        'delete'
      ]

      const subscriptionsEnabled =
        typeof graphqlSchemaDeclaration[modelName].subscriptions !== 'undefined'
          ? graphqlSchemaDeclaration[modelName].subscriptions
          : actions

      if (subscriptionsEnabled.includes('create')) {
        subscriptions[modelName + 'Created'] = {
          type: outputType,
          args: {
            id: { type: GraphQLInt }
          },
          subscribe: withFilter(
            () => pubSubInstance.asyncIterator(modelName + 'Created'),
            (payload, args) => true // @todo add a hook
          )
        }
      }
      if (subscriptionsEnabled.includes('update')) {
        subscriptions[modelName + 'Updated'] = {
          type: outputType,
          args: {
            id: { type: GraphQLInt }
          },
          subscribe: withFilter(
            () => pubSubInstance.asyncIterator(modelName + 'Updated'),
            (payload, args) => true // @todo add a hook
          )
        }
      }
      if (subscriptionsEnabled.includes('delete')) {
        subscriptions[modelName + 'Deleted'] = {
          type: outputType,
          args: {
            id: { type: GraphQLInt }
          },
          subscribe: withFilter(
            () => pubSubInstance.asyncIterator(modelName + 'Deleted'),
            (payload, args) => true // @todo add a hook
          )
        }
      }

      if (graphqlSchemaDeclaration[modelName].additionalSubscriptions) {
        Object.keys(
          graphqlSchemaDeclaration[modelName].additionalSubscriptions
        ).map(
          key =>
            (subscriptions[key] =
              graphqlSchemaDeclaration[modelName].additionalSubscriptions[key])
        )
      }

      return subscriptions
    },
    {}
  )

  return new GraphQLObjectType({
    name: 'Subscription',
    fields
  })
}

// This function is exported
const generateSchema = (graphqlSchemaDeclaration, types, models) => {
  return {
    query: generateQueryRootType(
      graphqlSchemaDeclaration,
      types.outputTypes,
      models
    ),
    mutation: generateMutationRootType(
      graphqlSchemaDeclaration,
      types.inputTypes,
      types.outputTypes,
      models
    ),
    subscription: generateSubscriptions(graphqlSchemaDeclaration, types)
  }
}

const generateGraphqlExpressMiddleware = (
  graphqlSchemaDeclaration,
  modelTypes,
  models,
  pubSubInstance,
  serverOptions = {}
) => {
  const graphqlSchema = new GraphQLSchema(
    generateSchema(graphqlSchemaDeclaration, modelTypes, models)
  )

  return graphqlExpress(req => ({
    schema: graphqlSchema,
    cacheControl: false,
    ...serverOptions
  }))
}

module.exports = {
  generateGraphqlExpressMiddleware,

  // @todo Remove following?
  generateModelTypes,
  generateSchema,
  generateGraphQLType,
  generateAssociationsFields,
  countResolver,
  pubSub: pubSubInstance,
  removeUnusedAttributes
}
