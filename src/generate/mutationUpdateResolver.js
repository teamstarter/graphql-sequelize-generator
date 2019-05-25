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
  globalPreCallback,
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
      const beforeHandle = globalPreCallback('updateBefore')
      data = await graphqlModelDeclaration.update.before(
        source,
        args,
        context,
        info
      )
      if (beforeHandle) {
        beforeHandle()
      }
    }

    const entity = await models[modelName].findOne({ where: { id: data.id } })

    if (!entity) {
      throw new Error(`${modelName} not found.`)
    }

    const snapshotBeforeUpdate = { ...entity.get({ plain: true }) }
    await entity.update(data)
    await entity.reload()

    if (
      graphqlModelDeclaration.update &&
      graphqlModelDeclaration.update.after
    ) {
      const afterHandle = globalPreCallback('updateAfter')
      const updatedEntity = await graphqlModelDeclaration.update.after(
        entity,
        snapshotBeforeUpdate,
        source,
        args,
        context,
        info
      )
      if (afterHandle) {
        afterHandle()
      }

      if (pubSubInstance) {
        pubSubInstance.publish(`${modelName}Updated`, {
          [`${modelName}Updated`]: updatedEntity.get()
        })
      }

      return updatedEntity
    }

    if (pubSubInstance) {
      pubSubInstance.publish(`${modelName}Updated`, {
        [`${modelName}Updated`]: entity.get()
      })
    }

    return entity
  }
})

module.exports = generateMutationUpdate
