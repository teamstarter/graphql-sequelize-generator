const { GraphQLNonNull } = require('graphql')
/**
 * Generates a create mutation operation
 *
 * @param {String} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} model
 * @param {*} graphqlModelDeclaration
 * @param {PubSub} pubSubInstance
 */
const generateMutationCreate = (
  modelName,
  inputType,
  outputType,
  model,
  graphqlModelDeclaration,
  pubSubInstance = null
) => ({
  type: outputType, // what is returned by resolve, must be of type GraphQLObjectType
  description: `Create a ${modelName}`,
  args: {
    [modelName]: { type: new GraphQLNonNull(inputType) },
    ...(graphqlModelDeclaration.create &&
    graphqlModelDeclaration.create.extraArg
      ? graphqlModelDeclaration.create.extraArg
      : {})
  },
  resolve: async (source, args, context, info) => {
    let attributes = args[modelName]
    if (
      graphqlModelDeclaration.create &&
      graphqlModelDeclaration.create.before
    ) {
      attributes = await graphqlModelDeclaration.create.before(
        source,
        args,
        context,
        info
      )
    }
    const newEntity = await model.create(attributes)

    if (
      graphqlModelDeclaration.create &&
      graphqlModelDeclaration.create.after
    ) {
      const updatedEntity = await graphqlModelDeclaration.create.after(
        newEntity,
        source,
        args,
        context,
        info
      )

      if (pubSubInstance) {
        pubSubInstance.publish(`${modelName}Created`, {
          [`${modelName}Created`]: updatedEntity.get()
        })
      }

      return updatedEntity
    }

    if (pubSubInstance) {
      pubSubInstance.publish(`${modelName}Created`, {
        [`${modelName}Created`]: newEntity.get()
      })
    }

    return newEntity
  }
})

module.exports = generateMutationCreate
