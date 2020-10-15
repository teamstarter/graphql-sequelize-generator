import {
  InputTypes,
  OutputTypes,
  SequelizeModels,
  Types
} from '../types/allTypes'
import generateGraphQLType from './graphQLType'

/**
 * Returns a collection of `GraphQLObjectType` generated from Sequelize models.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the types
 */
// This function is exported
export default function generateModelTypes(models: SequelizeModels): Types {
  const outputTypes: OutputTypes = {}
  const inputTypes: InputTypes = {}
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
