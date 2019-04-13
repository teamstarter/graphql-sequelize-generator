const { GraphQLNonNull } = require('graphql')
/**
 * Generates a update mutation operation
 *
 * @param {string} modelName Name of the generated model
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} model
 * @param {*} graphqlModelDeclaration
 * @param {*} models
 * @param {PubSub} pubSubInstance
 */
const generateMutationUpdate = (
  modelName,
  inputType,
  outputType,
  model,
  graphqlModelDeclaration,
  models,
  pubSubInstance = null
) => ({
  type: outputType,
  description: `Update a ${modelName}`,
  args: {
    [modelName]: { type: new GraphQLNonNull(inputType) },
    ...(graphqlModelDeclaration.update &&
    graphqlModelDeclaration.update.extraArg
      ? graphqlModelDeclaration.update.extraArg
      : {})
  },
  resolve: async (source, args, context, info) => {
    let data = args[modelName]
    if (
      graphqlModelDeclaration.update &&
      graphqlModelDeclaration.update.before
    ) {
      data = await graphqlModelDeclaration.update.before(
        source,
        args,
        context,
        info
      )
    }

    const object = await models[modelName].findOne({ where: { id: data.id } })

    if (!object) {
      throw new Error(`${modelName} not found.`)
    }

    const snapshotBeforeUpdate = { ...object.get({ plain: true }) }
    await object.update(data)
    await object.reload()

    if (
      graphqlModelDeclaration.update &&
      graphqlModelDeclaration.update.after
    ) {
      const updatedObject = graphqlModelDeclaration.update.after(
        object,
        snapshotBeforeUpdate,
        source,
        args,
        context,
        info
      )

      if (pubSubInstance) {
        pubSubInstance.publish(`${modelName}Updated`, {
          [`${modelName}Updated`]: updatedObject.get()
        })
      }

      return updatedObject
    }

    if (pubSubInstance) {
      pubSubInstance.publish(`${modelName}Updated`, {
        [`${modelName}Updated`]: object.get()
      })
    }

    return object
  }
})

module.exports = generateMutationUpdate
