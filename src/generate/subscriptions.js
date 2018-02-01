const { GraphQLInt, GraphQLObjectType } = require('graphql')
const { withFilter } = require('graphql-subscriptions')

module.exports = (graphqlSchemaDeclaration, types, pubSubInstance) => {
  if (!pubSubInstance) {
    return undefined
  }

  const fields = Object.keys(types.inputTypes).reduce(
    (subscriptions, modelName) => {
      const outputType = types.outputTypes[modelName]
      const actions = graphqlSchemaDeclaration[modelName].actions || [
        'create',
        'update',
        'delete'
      ]

      const subscriptionsEnabled =
        typeof graphqlSchemaDeclaration[modelName].subscriptions !== 'undefined'
          ? graphqlSchemaDeclaration[modelName].subscriptions
          : actions

      if (subscriptionsEnabled.includes('create')) {
        subscriptions[modelName + 'Created'] = {
          type: outputType,
          args: {
            id: { type: GraphQLInt }
          },
          subscribe: withFilter(
            () => pubSubInstance.asyncIterator(modelName + 'Created'),
            (payload, args) => true // @todo add a hook
          )
        }
      }
      if (subscriptionsEnabled.includes('update')) {
        subscriptions[modelName + 'Updated'] = {
          type: outputType,
          args: {
            id: { type: GraphQLInt }
          },
          subscribe: withFilter(
            () => pubSubInstance.asyncIterator(modelName + 'Updated'),
            (payload, args) => true // @todo add a hook
          )
        }
      }
      if (subscriptionsEnabled.includes('delete')) {
        subscriptions[modelName + 'Deleted'] = {
          type: outputType,
          args: {
            id: { type: GraphQLInt }
          },
          subscribe: withFilter(
            () => pubSubInstance.asyncIterator(modelName + 'Deleted'),
            (payload, args) => true // @todo add a hook
          )
        }
      }

      if (graphqlSchemaDeclaration[modelName].additionalSubscriptions) {
        Object.keys(
          graphqlSchemaDeclaration[modelName].additionalSubscriptions
        ).map(
          key =>
            (subscriptions[key] =
              graphqlSchemaDeclaration[modelName].additionalSubscriptions[key])
        )
      }

      return subscriptions
    },
    {}
  )

  return new GraphQLObjectType({
    name: 'Subscription',
    fields
  })
}
