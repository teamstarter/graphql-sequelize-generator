const { withFilter } = require('graphql-subscriptions')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'GraphQLInt... Remove this comment to see the full error message
const { GraphQLInt, GraphQLObjectType } = require('graphql')

const availableActions = ['create', 'update', 'delete']

function capitalizeFirstLetter(string: any) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateSu... Remove this comment to see the full error message
const generateSubscriptions = (
  graphqlSchemaDeclaration: any,
  types: any,
  pubSubInstance: any
) => {
  const fields = Object.keys(types.inputTypes).reduce(
    (subscriptions, modelName) => {
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
          // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
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
            // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
            (subscriptions[key] =
              graphqlSchemaDeclaration[modelName].additionalSubscriptions[key])
        )
      }

      return subscriptions
    },
    {}
  )

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'values' does not exist on type 'ObjectCo... Remove this comment to see the full error message
  if (Object.values(fields).length === 0) {
    return undefined
  }

  return new GraphQLObjectType({
    name: 'Subscription',
    fields
  })
}

module.exports = generateSubscriptions
