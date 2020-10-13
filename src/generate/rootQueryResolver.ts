const { GraphQLObjectType, GraphQLInt } = require('graphql')
const { defaultArgs, defaultListArgs } = require('graphql-sequelize')

const generateCountResolver = require('./countResolver')
const generateListResolver = require('./listResolver')

function getModelsFields(
  allSchemaDeclarations: any,
  outputTypes: any,
  models: any,
  globalPreCallback: any
) {
  return Object.keys(outputTypes).reduce((fields, modelTypeName) => {
    const modelType = outputTypes[modelTypeName]
    const schemaDeclaration = allSchemaDeclarations[modelType.name]
    if (typeof schemaDeclaration === 'undefined') {
      // If a model is not defined, we just ignore it.
      return fields
    }

    // One can exclude a given model from the root query.
    // It will only be used through associations.
    if (schemaDeclaration.excludeFromRoot === true) {
      return fields
    }

    if (!schemaDeclaration.model) {
      throw new Error(
        `You provided an empty/undefined model for the endpoint ${modelType}. Please provide a Sequelize model.`
      )
    }

    let result =
      schemaDeclaration.actions.indexOf('count') > -1
        ? {
            ...fields,
            // LIST RESOLVER
            [modelType.name]: generateListResolver(
              modelType,
              modelTypeName,
              allSchemaDeclarations,
              outputTypes,
              models,
              globalPreCallback
            ),
            // COUNT RESOLVER
            [`${modelType.name}Count`]: {
              type: GraphQLInt,
              args: {
                ...defaultArgs(schemaDeclaration.model),
                ...defaultListArgs()
              },
              resolve: generateCountResolver(
                schemaDeclaration.model,
                schemaDeclaration,
                globalPreCallback
              )
            }
          }
        : {
            ...fields,
            // LIST RESOLVER
            [modelType.name]: generateListResolver(
              modelType,
              modelTypeName,
              allSchemaDeclarations,
              outputTypes,
              models,
              globalPreCallback
            )
          }
    return result
  }, {})
}

function getCustomEndpoints(
  allSchemaDeclarations: any,
  outputTypes: any,
  models: any
) {
  return Object.keys(allSchemaDeclarations).reduce((fields, endpointKey) => {
    // We ignore all endpoints matching a model type.
    if (outputTypes[endpointKey]) {
      return fields
    }

    const endpointDeclaration = allSchemaDeclarations[endpointKey]

    // @todo counts should only be added if configured in the schema declaration
    return {
      ...fields,
      // The full endpoints must be manually declared.
      [endpointKey]: endpointDeclaration
    }
  }, {})
}

/**
 * Returns a root `GraphQLObjectType` used as query for `GraphQLSchema`.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the root `GraphQLSchema`
 */
export function generateQueryRootResolver(
  allSchemaDeclarations: any,
  outputTypes: any,
  models: any,
  globalPreCallback: any
) {
  // Endpoints depending on a model
  const modelFields = getModelsFields(
    allSchemaDeclarations,
    outputTypes,
    models,
    globalPreCallback
  )

  // Custom endpoints, without models specified.
  const customEndpoints = getCustomEndpoints(
    allSchemaDeclarations,
    outputTypes,
    models
  )

  const modelsKeys = Object.keys(modelFields)
  Object.keys(customEndpoints).filter(value => {
    if (modelsKeys.indexOf(value) !== -1) {
      throw new Error(
        `You created the custom endpoint (${value}) on the same key of an already defined model endpoint.`
      )
    }
  })

  return new GraphQLObjectType({
    name: 'Root_Query',
    fields: { ...modelFields, ...customEndpoints }
  })
}
