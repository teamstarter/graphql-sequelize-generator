const { argsToFindOptions } = require('graphql-sequelize')

module.exports = function countResolver (model, schemaDeclaration) {
  const listBefore =
    schemaDeclaration.list && schemaDeclaration.list.before
      ? schemaDeclaration.list.before
      : undefined

  // Count uses the same before function as the list, except if specified otherwise
  const countBefore =
    schemaDeclaration.count && schemaDeclaration.count.before
      ? schemaDeclaration.before
      : listBefore

  return async (source, args, context, info) => {
    if (typeof countBefore !== 'undefined') {
      const countOptions = await countBefore(
        argsToFindOptions.default(args, Object.keys(model.rawAttributes)),
        args,
        context,
        info
      )
      return model.count(countOptions)
    }
    return model.count(
      argsToFindOptions.default(args, Object.keys(model.rawAttributes))
    )
  }
}
