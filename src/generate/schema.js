const generateQueryRootResolver = require('./rootQueryResolver')
const generateSubscriptions = require('./subscriptions')
const generateMutation = require('./mutation')

const generateSchema = (
  graphqlSchemaDeclaration,
  types,
  models,
  pubSubInstance
) => {
  return {
    query: generateQueryRootResolver(
      graphqlSchemaDeclaration,
      types.outputTypes,
      models
    ),
    mutation: generateMutation(
      graphqlSchemaDeclaration,
      types.inputTypes,
      types.outputTypes,
      models
    ),
    subscription: generateSubscriptions(
      graphqlSchemaDeclaration,
      types,
      pubSubInstance
    )
  }
}

module.exports = generateSchema
