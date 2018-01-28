const {
  GraphQLObjectType,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLInt,
  GraphQLSchema
} = require('graphql')
const {
  resolver,
  attributeFields,
  defaultListArgs,
  defaultArgs
} = require('graphql-sequelize')

const generateMutationCreate = require('./generate/mutationCreate')
const generateMutationDelete = require('./generate/mutationDelete')
const generateMutationUpdate = require('./generate/mutationUpdate')

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
  let fields = {}
  for (let associationName in associations) {
    fields[associationName] = generateAssociationField(
      associations[associationName],
      types
    )
  }
  return fields
}

const generateAssociationField = (relation, types, resolver = null) => {
  const type =
    relation.associationType === 'BelongsToMany' ||
    relation.associationType === 'HasMany'
      ? new GraphQLList(types[relation.target.name])
      : types[relation.target.name]

  let field = {
    type
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
    fields: () =>
      Object.assign(
        attributeFields(model, {
          allowNull: !!isInput
        }),
        isInput
          ? generateAssociationsFields(model.associations, types, isInput)
          : {}
      )
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
  return (source, args, context, info) => {
    // @todo Allow to filter
    // Check https://github.com/mickhansen/graphql-sequelize/blob/master/src/resolver.js and use import {argsToFindOptions} from 'graphql-sequelize'.
    if (typeof before !== 'undefined') {
      return model.count(before({}, args, context))
    }
    return model.count()
  }
}

const allowOrderOnAssociations = (findOptions, args, context, info, model) => {
  if (typeof findOptions.order === 'undefined') {
    return findOptions
  }

  findOptions.order = findOptions.order.map(order => {
    // if there is exactly one dot, we check for associations
    const parts = order[0].split('.')
    if (parts.length === 2) {
      const associationName = parts[0]
      if (typeof model.associations[associationName] === 'undefined') {
        throw new Error(
          `Association ${associationName} unknown on model ${model.name} order`
        )
      }
      return [model.associations[associationName].target, parts[1], order[1]]
    }
    return order
  })
  return findOptions
}

const argsAdvancedProcessing = (
  findOptions,
  args,
  context,
  info,
  listBefore,
  model
) => {
  findOptions = allowOrderOnAssociations(
    findOptions,
    args,
    context,
    info,
    model
  )

  if (listBefore) {
    return listBefore(findOptions, args, context, info)
  }
  return findOptions
}

const createResolver = (graphqlTypeDeclaration, relation = null) => {
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
        graphqlTypeDeclaration.model
      )
  })
}

const injectAssociations = (
  modelType,
  graphqlSchemaDeclaration,
  outputTypes
) => {
  const associations =
    graphqlSchemaDeclaration[modelType.name].model.associations
  if (Object.keys(associations).length === 0) {
    return modelType
  }
  let fields = {}
  for (let associationName in associations) {
    fields[associationName] = generateAssociationField(
      associations[associationName],
      outputTypes,
      createResolver(
        graphqlSchemaDeclaration[associations[associationName].target.name],
        associations[associationName]
      )
    )
  }
  // We have to mutate the original field, as type names must be unique
  // We cannot return a new type as the type may have already been used
  // In previous models.
  modelType._typeConfig.fields = () =>
    Object.assign(
      attributeFields(graphqlSchemaDeclaration[modelType.name].model, {
        allowNull: false
      }),
      fields
    )
  return modelType
}

/**
 * Returns a root `GraphQLObjectType` used as query for `GraphQLSchema`.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the root `GraphQLSchema`
 */
const generateQueryRootType = (graphqlSchemaDeclaration, outputTypes) => {
  let fields = Object.keys(outputTypes).reduce((fields, modelTypeName) => {
    const modelType = outputTypes[modelTypeName]
    const dec = graphqlSchemaDeclaration[modelType.name]
    if (typeof dec === 'undefined') {
      throw new Error(`The model type ${modelType.name} is not defined`)
    }

    const listBefore = dec.list && dec.list.before ? dec.list.before : undefined

    const ApiFields = Object.assign(fields, {
      [modelType.name]: {
        type: new GraphQLList(
          injectAssociations(modelType, graphqlSchemaDeclaration, outputTypes)
        ),
        args: Object.assign(
          Object.assign(defaultArgs(dec.model), defaultListArgs()),
          dec.list && dec.list.extraArg ? dec.list.extraArg : {}
        ),
        resolve: createResolver(dec)
      }
    })

    // Count uses the same before function as the list, except if specified otherwise
    const countBefore = dec.count && dec.count.before ? dec.before : listBefore

    // @todo counts should only be added if configured in the schema declaration
    return Object.assign(ApiFields, {
      [`${modelType.name}Count`]: {
        type: GraphQLInt,
        args: Object.assign(defaultArgs(dec.model), defaultListArgs()),
        resolve: countResolver(dec.model, {
          before: countBefore
        })
      }
    })
  }, {})

  // Any field that is not related to aa model name is inject "as-it" in the fields.
  fields = Object.keys(graphqlSchemaDeclaration)
    .filter(key => typeof outputTypes[key] === 'undefined')
    .reduce((fields, customFieldName) => {
      return Object.assign(fields, {
        [customFieldName]: graphqlSchemaDeclaration[customFieldName]
      })
    }, fields)

  return new GraphQLObjectType({
    name: 'Root_Query',
    fields
  })
}

const generateMutationRootType = (
  graphqlSchemaDeclaration,
  inputTypes,
  outputTypes
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
          : generateMutationCreate(
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
          : generateMutationUpdate(
            modelName,
            inputType,
            outputType,
            model,
            graphqlSchemaDeclaration[modelName]
          )
    }
    if (actions.includes('delete')) {
      mutations[modelName + 'Delete'] = graphqlSchemaDeclaration[modelName]
        .delete.resolve
        ? graphqlSchemaDeclaration[modelName].delete
        : generateMutationDelete(
          modelName,
          inputType,
          outputType,
          graphqlSchemaDeclaration[modelName]
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

// This function is exported
const generateSchema = (graphqlSchemaDeclaration, types) => {
  return new GraphQLSchema({
    query: generateQueryRootType(graphqlSchemaDeclaration, types.outputTypes),
    mutation: generateMutationRootType(
      graphqlSchemaDeclaration,
      types.inputTypes,
      types.outputTypes
    )
  })
}

module.exports = {
  generateModelTypes,
  generateSchema,
  generateMutationRootType
}
