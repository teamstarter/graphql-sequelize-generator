import { GraphQLList, GraphQLType } from 'graphql'
import { defaultArgs, defaultListArgs } from 'graphql-sequelize'

import createResolver from '../createResolver'
import injectAssociations from '../associations/inject'
/**
 * Returns a root `GraphQLObjectType` used as query for `GraphQLSchema`.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the root `GraphQLSchema`
 */
export default function generateListResolver(
  modelType: any,
  allSchemaDeclarations: any,
  outputTypes: any,
  models: any,
  globalPreCallback: any
): {
  type: GraphQLList<GraphQLType>
  args: any
  resolve: any
} {
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
