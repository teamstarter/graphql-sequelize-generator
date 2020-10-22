import { GraphQLSchemaConfig } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import _debug from 'debug'

import generateQueryRootResolver from './root/query'
import generateSubscriptions from './root/subscriptions'
import generateMutation from './root/mutation'
import {
  GlobalPreCallback,
  graphqlSchemaDeclarationType,
  MutationList,
  SequelizeModels,
  Types
} from '../types'

const debug = _debug('gsg')

export default function generateSchema({
  graphqlSchemaDeclaration,
  types,
  models,
  customMutations,
  globalPreCallback = () => null,
  pubSubInstance
}: {
  graphqlSchemaDeclaration: graphqlSchemaDeclarationType
  types: Types
  models: SequelizeModels
  customMutations?: MutationList
  globalPreCallback?: GlobalPreCallback
  pubSubInstance?: PubSub | null
}): GraphQLSchemaConfig {
  const mutationExists =
    !!customMutations ||
    Object.values(graphqlSchemaDeclaration).some((type: any) => {
      if (type.actions) {
        return ['create', 'delete', 'update'].some(action =>
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
        pubSubInstance
      )
    })
  }

  // Do not generate subscriptions if no ways of propagating information is defined.
  if (pubSubInstance) {
    definition.subscription = generateSubscriptions(
      graphqlSchemaDeclaration,
      types,
      pubSubInstance
    )
  }

  let resolverTab: string[] = ['list', 'create', 'update', 'delete', 'count']

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
