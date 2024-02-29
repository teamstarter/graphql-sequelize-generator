import { GraphQLInt, GraphQLObjectType } from 'graphql'
import { PubSub, withFilter } from 'graphql-subscriptions'
import { isGraphqlFieldDeclaration } from '../isGraphqlFieldDeclaration'
import {
  CreateFieldDeclarationType,
  DeleteFieldDeclarationType,
  EventList,
  GraphqlSchemaDeclarationType,
  UpdateFieldDeclarationType,
} from '../types/types'

const availableActions: EventList = ['create', 'update', 'delete']

function capitalizeFirstLetter(string: any) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export default function generateSubscriptions(
  graphqlSchemaDeclaration: GraphqlSchemaDeclarationType,
  types: any,
  pubSubInstance: PubSub
): GraphQLObjectType | undefined {
  const fields = Object.keys(types.inputTypes).reduce(
    (subscriptions: any, modelName: string) => {
      if (!graphqlSchemaDeclaration[modelName]) {
        return subscriptions
      }

      const outputType = types.outputTypes[modelName]
      const declaration = graphqlSchemaDeclaration[modelName]

      if (isGraphqlFieldDeclaration(declaration)) {
        return subscriptions
      }

      const subscriptionsEnabled: EventList = declaration.subscriptions || []

      availableActions.forEach((action) => {
        if (subscriptionsEnabled.includes(action)) {
          // ex: name = "userUpdated"
          const name = `${modelName}${capitalizeFirstLetter(action)}d`
          const configuration = declaration[action]

          let subscriptionFunction: any = () => true

          if (
            typeof configuration !== 'undefined' &&
            Object.prototype.hasOwnProperty.call(
              configuration,
              'subscriptionFilter'
            )
          ) {
            subscriptionFunction = (
              configuration as
                | CreateFieldDeclarationType
                | DeleteFieldDeclarationType<any>
                | UpdateFieldDeclarationType
            ).subscriptionFilter
          }

          subscriptions[name] = {
            type: outputType,
            args: {
              id: { type: GraphQLInt },
            },
            subscribe: withFilter(
              () => pubSubInstance.asyncIterator(name),
              subscriptionFunction
            ),
          }
        }
      })

      /** Subscription an be manually added, following declaration is requiered because typescript sucks. */
      const s = declaration.additionalSubscriptions
      if (typeof s !== 'undefined') {
        Object.keys(s).map((key) => (subscriptions[key] = s[key]))
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
    fields,
  })
}
