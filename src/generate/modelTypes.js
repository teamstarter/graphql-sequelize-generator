const generateGraphQLType = require('./graphQLType')
/**
 * Returns a collection of `GraphQLObjectType` generated from Sequelize models.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the types
 */
// This function is exported
const generateModelTypes = models => {
  const outputTypes = {}
  const inputTypes = {}
  for (const modelName in models) {
    const model = models[modelName]
    // Only our models, not Sequelize nor sequelize
    if (
      Object.prototype.hasOwnProperty.call(model, 'name') &&
      modelName !== 'Sequelize'
    ) {
      outputTypes[modelName] = generateGraphQLType(model, outputTypes)
      inputTypes[modelName] = generateGraphQLType(model, inputTypes, true)
    }
  }
  return { outputTypes, inputTypes }
}

module.exports = generateModelTypes
