const generateQueryRootResolver = require('./rootQueryResolver')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateSu... Remove this comment to see the full error message
const generateSubscriptions = require('./subscriptions')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateMu... Remove this comment to see the full error message
const generateMutation = require('./mutation')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateSc... Remove this comment to see the full error message
const generateSchema = ({
  graphqlSchemaDeclaration,
  types,
  models,
  customMutations,
  globalPreCallback = () => null,
  pubSubInstance
}: any) => {
  const mutationExists =
    !!customMutations ||
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'ObjectCo... Remove this comment to see the full error message
    Object.values(graphqlSchemaDeclaration).some((type: any) => {
      if (type.actions) {
        return ['create', 'delete', 'update'].some(action =>
          type.actions.includes(action)
        )
      }
      return !!type.additionalMutations
    })

  const definition = {
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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'subscription' does not exist on type '{ ... Remove this comment to see the full error message
    definition.subscription = generateSubscriptions(
      graphqlSchemaDeclaration,
      types,
      pubSubInstance
    )
  }

  return definition
}

module.exports = generateSchema
