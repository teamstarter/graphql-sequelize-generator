const { GraphQLInputObjectType, GraphQLObjectType } = require('graphql')
const { attributeFields } = require('graphql-sequelize')

import generateAssociationsFields from '../associations/fields'
/**
 * Returns a new `GraphQLObjectType` created from a sequelize model.
 *
 * It creates a `GraphQLObjectType` object with a name and fields. The
 * fields are generated from its sequelize associations.
 * @param {*} model The sequelize model used to create the `GraphQLObjectType`
 * @param {*} types Existing `GraphQLObjectType` types, created from all the Sequelize models
 */
export default function generateGraphQLType(
  model: any,
  types: any,
  isInput = false
) {
  const GraphQLClass = isInput ? GraphQLInputObjectType : GraphQLObjectType
  const type = new GraphQLClass({
    name: isInput ? `${model.name}Input` : model.name,
    fields: () => ({
      ...attributeFields(model, {
        allowNull: !!isInput,
        commentToDescription: true,
      }),
      ...(isInput ? generateAssociationsFields(model.associations, types) : {}),
    }),
  })
  return type
}
