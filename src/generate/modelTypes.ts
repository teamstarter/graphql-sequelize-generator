// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateGr... Remove this comment to see the full error message
const generateGraphQLType = require('./graphQLType')
/**
 * Returns a collection of `GraphQLObjectType` generated from Sequelize models.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the types
 */
// This function is exported
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateMo... Remove this comment to see the full error message
const generateModelTypes = (models: any) => {
  const outputTypes = {}
  const inputTypes = {}
  for (const modelName in models) {
    const model = models[modelName]
    // Only our models, not Sequelize nor sequelize
    if (
      Object.prototype.hasOwnProperty.call(model, 'name') &&
      modelName !== 'Sequelize'
    ) {
      // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
      outputTypes[modelName] = generateGraphQLType(model, outputTypes)
      // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
      inputTypes[modelName] = generateGraphQLType(model, inputTypes, true)
    }
  }
  return { outputTypes, inputTypes }
}

module.exports = generateModelTypes
