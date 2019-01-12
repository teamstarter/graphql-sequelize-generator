const { GraphQLObjectType, GraphQLInt } = require('graphql')
const { defaultArgs, defaultListArgs } = require('graphql-sequelize')

const generateCountResolver = require('./countResolver')
const generateListResolver = require('./listResolver')

/**
 * Returns a root `GraphQLObjectType` used as query for `GraphQLSchema`.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the root `GraphQLSchema`
 */
module.exports = function generateQueryRootResolver (
  allSchemaDeclarations,
  outputTypes,
  models
) {
  return new GraphQLObjectType({
    name: 'Root_Query',
    fields: Object.keys(outputTypes).reduce((fields, modelTypeName) => {
      const modelType = outputTypes[modelTypeName]
      const schemaDeclaration = allSchemaDeclarations[modelType.name]
      if (typeof schemaDeclaration === 'undefined') {
        // If a model is not defined, we just ignore it.
        return fields
      }

      // @todo counts should only be added if configured in the schema declaration
      return {
        ...fields,
        // LIST RESOLVER
        [modelType.name]: generateListResolver(
          modelType,
          modelTypeName,
          allSchemaDeclarations,
          outputTypes,
          models
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
            schemaDeclaration
          )
        }
      }
    }, {})
  })
}
