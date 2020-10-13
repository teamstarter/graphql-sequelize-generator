const { withFilter } = require('graphql-subscriptions')
const { GraphQLInt, GraphQLObjectType } = require('graphql')

const availableActions = ['create', 'update', 'delete']

function capitalizeFirstLetter(string: any) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export default function generateSubscriptions(
  graphqlSchemaDeclaration: any,
  types: any,
  pubSubInstance: any
) {
  const fields = Object.keys(types.inputTypes).reduce(
    (subscriptions: any, modelName: string) => {
      const outputType = types.outputTypes[modelName]
      if (!graphqlSchemaDeclaration[modelName]) {
        return subscriptions
      }

      const subscriptionsEnabled =
        typeof graphqlSchemaDeclaration[modelName].subscriptions !== 'undefined'
          ? graphqlSchemaDeclaration[modelName].subscriptions
          : []

      availableActions.forEach(action => {
        if (subscriptionsEnabled.includes(action)) {
          // ex: name = "userUpdated"
          const name = `${modelName}${capitalizeFirstLetter(action)}d`
          subscriptions[name] = {
            type: outputType,
            args: {
              id: { type: GraphQLInt }
            },
            subscribe: withFilter(
              () => pubSubInstance.asyncIterator(name),
              graphqlSchemaDeclaration[modelName][action] &&
                graphqlSchemaDeclaration[modelName][action].subscriptionFilter
                ? graphqlSchemaDeclaration[modelName][action].subscriptionFilter
                : () => true
            )
          }
        }
      })

      /** Subscription an be manually added */
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

  if (Object.values(fields).length === 0) {
    return undefined
  }

  return new GraphQLObjectType({
    name: 'Subscription',
    fields
  })
}
