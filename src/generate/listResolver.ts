// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'GraphQLLis... Remove this comment to see the full error message
const { GraphQLList } = require('graphql')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'defaultArg... Remove this comment to see the full error message
const { defaultArgs, defaultListArgs } = require('graphql-sequelize')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createReso... Remove this comment to see the full error message
const createResolver = require('../createResolver')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'injectAsso... Remove this comment to see the full error message
const { injectAssociations } = require('./associationsFields')
/**
 * Returns a root `GraphQLObjectType` used as query for `GraphQLSchema`.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the root `GraphQLSchema`
 */
module.exports = function generateListResolver(
  modelType: any,
  modelTypeName: any,
  allSchemaDeclarations: any,
  outputTypes: any,
  models: any,
  globalPreCallback: any
) {
  const schemaDeclaration = allSchemaDeclarations[modelType.name]

  if (!schemaDeclaration.model) {
    throw new Error(
      `You provided an empty/undefined model for the endpoint ${modelType}. Please provide a Sequelize model.`
    )
  }

  return {
    type: new GraphQLList(
      injectAssociations(
        modelType,
        allSchemaDeclarations,
        outputTypes,
        models,
        globalPreCallback
      )
    ),
    args: {
      ...defaultArgs(schemaDeclaration.model),
      ...defaultListArgs(),
      ...(schemaDeclaration.list && schemaDeclaration.list.extraArg
        ? schemaDeclaration.list.extraArg
        : {})
    },
    resolve: createResolver(schemaDeclaration, models, globalPreCallback)
  }
}
