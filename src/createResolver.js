const { resolver } = require('graphql-sequelize')
const { argsAdvancedProcessing } = require('./index')

const createResolver = (graphqlTypeDeclaration, models, relation = null) => {
  if (
    graphqlTypeDeclaration &&
    graphqlTypeDeclaration.list &&
    graphqlTypeDeclaration.list.resolver
  ) {
    return graphqlTypeDeclaration.list.resolver
  }

  const listBefore =
    graphqlTypeDeclaration.list && graphqlTypeDeclaration.list.before
      ? graphqlTypeDeclaration.list.before
      : undefined
  return resolver(relation || graphqlTypeDeclaration.model, {
    before: (findOptions, args, context, info) => {
      const processedFindOptions = argsAdvancedProcessing(
        findOptions,
        args,
        context,
        info,
        listBefore,
        graphqlTypeDeclaration.model,
        models
      )

      if (listBefore) {
        return listBefore(processedFindOptions, args, context, info)
      }
      return processedFindOptions
    }
  })
}

module.exports = createResolver
