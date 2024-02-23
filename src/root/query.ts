import { GraphQLFieldConfig, GraphQLInt, GraphQLObjectType } from 'graphql'
import { defaultArgs, defaultListArgs } from 'graphql-sequelize'
import {
  GlobalPreCallback,
  GraphqlSchemaDeclarationType,
  ModelDeclarationType,
  OutputTypes,
  SequelizeModels,
} from '../../types'

import generateCountResolver from '../queryResolvers/count'
import generateListResolver from '../queryResolvers/list'

function getModelsFields(
  allSchemaDeclarations: GraphqlSchemaDeclarationType,
  outputTypes: OutputTypes,
  models: SequelizeModels,
  globalPreCallback: GlobalPreCallback
) {
  return Object.keys(outputTypes).reduce((fields, modelTypeName) => {
    const modelType = outputTypes[modelTypeName]
    const schemaDeclaration = allSchemaDeclarations[
      modelType.name
    ] as ModelDeclarationType

    if (typeof schemaDeclaration === 'undefined') {
      // If a model is not defined, we just ignore it.
      return fields
    }

    // eslint-disable-next-line no-prototype-builtins
    if (!schemaDeclaration.hasOwnProperty('model')) {
      throw new Error(
        `You provided an empty/undefined model for the endpoint ${modelType}. Please provide a Sequelize model.`
      )
    }

    // One can exclude a given model from the root query.
    // It will only be used through associations.
    if (schemaDeclaration.excludeFromRoot === true) {
      return fields
    }
    const result =
      schemaDeclaration.actions &&
      schemaDeclaration.actions.indexOf('count') > -1
        ? {
            ...fields,
            // LIST RESOLVER
            [modelType.name]: generateListResolver(
              modelType,
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
                ...defaultListArgs(),
                ...(schemaDeclaration.count && schemaDeclaration.count.extraArg
                  ? schemaDeclaration.count.extraArg
                  : // If not count extraArgs are specified, we use the list one by default
                  // as we already use the list before by default.
                  schemaDeclaration.list && schemaDeclaration.list.extraArg
                  ? schemaDeclaration.list.extraArg
                  : {}),
              },
              resolve: generateCountResolver(
                schemaDeclaration.model,
                schemaDeclaration,
                globalPreCallback
              ),
            },
          }
        : {
            ...fields,
            // LIST RESOLVER
            [modelType.name]: generateListResolver(
              modelType,
              allSchemaDeclarations,
              outputTypes,
              models,
              globalPreCallback
            ),
          }
    return result
  }, {})
}

function getCustomEndpoints(
  allSchemaDeclarations: GraphqlSchemaDeclarationType,
  outputTypes: OutputTypes
) {
  return Object.keys(allSchemaDeclarations).reduce((fields, endpointKey) => {
    // We ignore all endpoints matching a model type.
    if (outputTypes[endpointKey]) {
      return fields
    }

    const endpointDeclaration = allSchemaDeclarations[
      endpointKey
    ] as GraphQLFieldConfig<any, any, any>

    // @todo counts should only be added if configured in the schema declaration
    return {
      ...fields,
      // The full endpoints must be manually declared.
      [endpointKey]: endpointDeclaration,
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
export default function generateQueryRootResolver(
  allSchemaDeclarations: GraphqlSchemaDeclarationType,
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
  const customEndpoints = getCustomEndpoints(allSchemaDeclarations, outputTypes)

  const modelsKeys = Object.keys(modelFields)
  Object.keys(customEndpoints).filter((value) => {
    if (modelsKeys.indexOf(value) !== -1) {
      throw new Error(
        `You created the custom endpoint (${value}) on the same key of an already defined model endpoint.`
      )
    }
  })

  return new GraphQLObjectType({
    name: 'Root_Query',
    fields: { ...modelFields, ...customEndpoints },
  })
}
