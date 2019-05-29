const generateQueryRootResolver = require('./rootQueryResolver')
const generateSubscriptions = require('./subscriptions')
const generateMutation = require('./mutation')

const generateSchema = ({
  graphqlSchemaDeclaration,
  types,
  models,
  customMutations,
  globalPreCallback = () => null,
  pubSubInstance
}) => {
  const definition = {
    query: generateQueryRootResolver(
      graphqlSchemaDeclaration,
      types.outputTypes,
      models,
      globalPreCallback
    ),
    mutation: generateMutation(
      graphqlSchemaDeclaration,
      types.inputTypes,
      types.outputTypes,
      models,
      globalPreCallback,
      customMutations,
      pubSubInstance
    )
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

module.exports = generateSchema
