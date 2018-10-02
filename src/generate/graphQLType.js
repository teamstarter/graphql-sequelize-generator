const { GraphQLInputObjectType, GraphQLObjectType } = require('graphql')
const { attributeFields } = require('graphql-sequelize')

const { generateAssociationsFields } = require('./associationsFields')
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

module.exports = generateGraphQLType
