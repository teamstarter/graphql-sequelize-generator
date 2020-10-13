// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'GraphQLObj... Remove this comment to see the full error message
const { GraphQLInputObjectType, GraphQLObjectType } = require('graphql')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'attributeF... Remove this comment to see the full error message
const { attributeFields } = require('graphql-sequelize')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateAs... Remove this comment to see the full error message
const { generateAssociationsFields } = require('./associationsFields')
/**
 * Returns a new `GraphQLObjectType` created from a sequelize model.
 *
 * It creates a `GraphQLObjectType` object with a name and fields. The
 * fields are generated from its sequelize associations.
 * @param {*} model The sequelize model used to create the `GraphQLObjectType`
 * @param {*} types Existing `GraphQLObjectType` types, created from all the Sequelize models
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateGr... Remove this comment to see the full error message
const generateGraphQLType = (model: any, types: any, isInput = false) => {
  const GraphQLClass = isInput ? GraphQLInputObjectType : GraphQLObjectType
  const type = new GraphQLClass({
    name: isInput ? `${model.name}Input` : model.name,
    fields: () => ({
      ...attributeFields(model, {
        allowNull: !!isInput
      }),
      ...(isInput ? generateAssociationsFields(model.associations, types) : {})
    })
  })
  return type
}

module.exports = generateGraphQLType
