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
    let selectedModel = args[modelName]
    if (
      graphqlModelDeclaration.create &&
      graphqlModelDeclaration.create.before
    ) {
      selectedModel = await graphqlModelDeclaration.create.before(
        source,
        args,
        context,
        info
      )
    }
    const newModel = await model.create(selectedModel)

    if (
      graphqlModelDeclaration.create &&
      graphqlModelDeclaration.create.after
    ) {
      const updatedModel = graphqlModelDeclaration.create.after(
        newModel,
        source,
        args,
        context,
        info
      )

      if (pubSubInstance) {
        pubSubInstance.publish(`${modelName}Created`, {
          [`${modelName}Created`]: updatedModel.get()
        })
      }

      return updatedModel
    }

    if (pubSubInstance) {
      pubSubInstance.publish(`${modelName}Created`, {
        [`${modelName}Created`]: newModel.get()
      })
    }

    return newModel
  }
})

module.exports = generateMutationCreate
