const { GraphQLInt, GraphQLNonNull } = require('graphql')
/**
 * Generates a delete mutation operation
 *
 * @param {*} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} model
 */
const generateMutationDelete = (
  modelName,
  inputType,
  outputType,
  graphqlModelDeclaration,
  models
) => ({
  type: GraphQLInt,
  description: 'Delete a ' + modelName,
  args: {
    id: { type: new GraphQLNonNull(GraphQLInt) }
  },
  resolve: async (source, args, context, info) => {
    let where = { id: args.id }
    if (
      graphqlModelDeclaration.delete &&
      graphqlModelDeclaration.delete.before
    ) {
      where = await graphqlModelDeclaration.delete.before(
        where,
        source,
        args,
        context,
        info
      )
    }

    const entity = await models[modelName].findOne({ where })

    if (!entity) {
      throw new Error(`${modelName} not found.`)
    }

    const rowDeleted = await graphqlModelDeclaration.model.destroy({
      where
    }) // Returns the number of rows affected (0 or 1)

    if (
      graphqlModelDeclaration.delete &&
      graphqlModelDeclaration.delete.after
    ) {
      await graphqlModelDeclaration.delete.after(
        entity,
        source,
        args,
        context,
        info
      )
    }
    return rowDeleted
  }
})

module.exports = generateMutationDelete
