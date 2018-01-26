const { GraphQLInt, GraphQLNonNull } = require('graphql')

/**
 * Generates a delete mutation operation
 *
 * @param {*} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} model
 */
module.exports = (
  modelName,
  inputType,
  outputType,
  graphqlModelDeclaration
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
    const rowDeleted = await graphqlModelDeclaration.model.destroy({
      where
    }) // Returns the number of rows affected (0 or 1)
    return rowDeleted
  }
})
