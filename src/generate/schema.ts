const generateQueryRootResolver = require('./rootQueryResolver')
const generateSubscriptions = require('./subscriptions')
const generateMutation = require('./mutation')

export const generateSchema = ({
  graphqlSchemaDeclaration,
  types,
  models,
  customMutations,
  globalPreCallback = () => null,
  pubSubInstance
}: any) => {
  const mutationExists =
    !!customMutations ||
    Object.values(graphqlSchemaDeclaration).some((type: any) => {
      if (type.actions) {
        return ['create', 'delete', 'update'].some(action =>
          type.actions.includes(action)
        )
      }
      return !!type.additionalMutations
    })

  const definition: any = {
    query: generateQueryRootResolver(
      graphqlSchemaDeclaration,
      types.outputTypes,
      models,
      globalPreCallback
    ),
    ...(mutationExists && {
      mutation: generateMutation(
        graphqlSchemaDeclaration,
        types.inputTypes,
        types.outputTypes,
        models,
        globalPreCallback,
        customMutations,
        pubSubInstance
      )
    })
  }

  // Do not generate subscriptions if no ways of propagating information is defined.
  if (pubSubInstance) {
    definition.subscription = generateSubscriptions(
      graphqlSchemaDeclaration,
      types,
      pubSubInstance
    )
  }

  return definition
}
