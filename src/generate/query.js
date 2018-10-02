const { GraphQLObjectType, GraphQLList, GraphQLInt } = require('graphql')
const { defaultArgs, defaultListArgs } = require('graphql-sequelize')

const { countResolver } = require('./../')
const createResolver = require('./../createResolver')
const { injectAssociations } = require('./associationsFields')
/**
 * Returns a root `GraphQLObjectType` used as query for `GraphQLSchema`.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the root `GraphQLSchema`
 */
const generateQuery = (graphqlSchemaDeclaration, outputTypes, models) => {
  return new GraphQLObjectType({
    name: 'Root_Query',
    fields: Object.keys(outputTypes).reduce((fields, modelTypeName) => {
      const modelType = outputTypes[modelTypeName]
      const schemaDeclaration = graphqlSchemaDeclaration[modelType.name]
      if (typeof schemaDeclaration === 'undefined') {
        throw new Error(`The model type ${modelType.name} is not defined`)
      }

      const listBefore =
        schemaDeclaration.list && schemaDeclaration.list.before
          ? schemaDeclaration.list.before
          : undefined

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
            ...defaultArgs(schemaDeclaration.model),
            ...defaultListArgs(),
            ...(schemaDeclaration.list && schemaDeclaration.list.extraArg
              ? schemaDeclaration.list.extraArg
              : {})
          },
          resolve: createResolver(schemaDeclaration, models)
        }
      }

      // Count uses the same before function as the list, except if specified otherwise
      const countBefore =
        schemaDeclaration.count && schemaDeclaration.count.before
          ? schemaDeclaration.before
          : listBefore

      // @todo counts should only be added if configured in the schema declaration
      return {
        ...ApiFields,
        [`${modelType.name}Count`]: {
          type: GraphQLInt,
          args: {
            ...defaultArgs(schemaDeclaration.model),
            ...defaultListArgs()
          },
          resolve: countResolver(schemaDeclaration.model, {
            before: countBefore
          })
        }
      }
    }, {})
  })
}

module.exports = generateQuery
