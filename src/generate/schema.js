const generateQueryRootResolver = require('./rootQueryResolver')
const generateSubscriptions = require('./subscriptions')
const generateMutation = require('./mutation')

const generateSchema = (
  graphqlSchemaDeclaration,
  types,
  models,
  pubSubInstance
) => {
  const definition = {
    query: generateQueryRootResolver(
      graphqlSchemaDeclaration,
      types.outputTypes,
      models
    ),
    mutation: generateMutation(
      graphqlSchemaDeclaration,
      types.inputTypes,
      types.outputTypes,
      models,
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
