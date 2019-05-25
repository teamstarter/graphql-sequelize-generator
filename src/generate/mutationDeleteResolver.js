const { GraphQLInt, GraphQLNonNull } = require('graphql')
/**
 * Generates a delete mutation operation
 *
 * @param {String} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} graphqlModelDeclaration
 * @param {*} models
 * @param {PubSub} pubSubInstance
 */
const generateMutationDelete = (
  modelName,
  inputType,
  outputType,
  graphqlModelDeclaration,
  models,
  globalPreCallback,
  pubSubInstance = null
) => ({
  type: GraphQLInt,
  description: `Delete a ${modelName}`,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) }
  },
  resolve: async (source, args, context, info) => {
    let where = { id: args.id }
    if (
      graphqlModelDeclaration.delete &&
      graphqlModelDeclaration.delete.before
    ) {
      const beforeHandle = globalPreCallback('deleteBefore')
      where = await graphqlModelDeclaration.delete.before(
        where,
        source,
        args,
        context,
        info
      )
      if (beforeHandle) {
        beforeHandle()
      }
    }

    const entity = await models[modelName].findOne({ where })

    if (!entity) {
      throw new Error(`${modelName} not found.`)
    }

    const rowDeleted = await graphqlModelDeclaration.model.destroy({
      where
    }) // Returns the number of rows affected (0 or 1)

    if (pubSubInstance) {
      pubSubInstance.publish(`${modelName}Deleted`, {
        [`${modelName}Deleted`]: entity.get()
      })
    }

    if (
      graphqlModelDeclaration.delete &&
      graphqlModelDeclaration.delete.after
    ) {
      const afterHandle = globalPreCallback('deleteAfter')
      await graphqlModelDeclaration.delete.after(
        entity,
        source,
        args,
        context,
        info
      )
      if (afterHandle) {
        afterHandle()
      }
    }
    return rowDeleted
  }
})

module.exports = generateMutationDelete
