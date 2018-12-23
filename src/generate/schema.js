const generateQuery = require('./query')
const generateSubscriptions = require('./subscriptions')
const generateMutation = require('./mutation')

const generateSchema = (graphqlSchemaDeclaration, types, models) => {
  return {
    query: generateQuery(graphqlSchemaDeclaration, types.outputTypes, models),
    mutation: generateMutation(
      graphqlSchemaDeclaration,
      types.inputTypes,
      types.outputTypes,
      models
    ),
    subscription: generateSubscriptions(graphqlSchemaDeclaration, types)
  }
}

module.exports = generateSchema
