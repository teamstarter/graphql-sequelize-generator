import _debug from 'debug'
import { GraphQLSchemaConfig } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

import generateMutation from './root/mutation'
import generateQueryRootResolver from './root/query'
import generateSubscriptions from './root/subscriptions'
import {
  GlobalPreCallback,
  GraphqlSchemaDeclarationType,
  InAndOutTypes,
  MutationList,
  SequelizeModels,
} from './types/types'

const debug = _debug('gsg')

export default function generateSchema({
  graphqlSchemaDeclaration,
  types,
  models,
  customMutations,
  globalPreCallback = () => null,
  pubSubInstance,
  callWebhook,
}: {
  graphqlSchemaDeclaration: GraphqlSchemaDeclarationType
  types: InAndOutTypes
  models: SequelizeModels
  customMutations?: MutationList
  globalPreCallback?: GlobalPreCallback
  pubSubInstance?: PubSub | null
  callWebhook: Function
}): GraphQLSchemaConfig {
  const mutationExists =
    !!customMutations ||
    Object.values(graphqlSchemaDeclaration).some((type: any) => {
      if (type.actions) {
        return ['create', 'delete', 'update'].some((action) =>
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
        pubSubInstance,
        callWebhook
      ),
    }),
  }

  // Do not generate subscriptions if no ways of propagating information is defined.
  if (pubSubInstance) {
    definition.subscription = generateSubscriptions(
      graphqlSchemaDeclaration,
      types,
      pubSubInstance
    )
  }

  const resolverTab: string[] = ['list', 'create', 'update', 'delete', 'count']

  Object.keys(graphqlSchemaDeclaration).forEach((key: string) => {
    const schema: any = graphqlSchemaDeclaration[key]
    if (!schema.before) {
      resolverTab.forEach((resolverName: string) => {
        const resolverBefore =
          schema[resolverName] && schema[resolverName].before
            ? schema[resolverName].before
            : undefined
        if (!resolverBefore) {
          debug(
            `The ${resolverName} resolver of ${key} has no before hook. This may represent a security issue!`
          )
        }
      })
    }
  })

  return definition
}
