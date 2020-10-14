import { GraphQLSchemaConfig } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

import generateQueryRootResolver from './rootQueryResolver'
import generateSubscriptions from './subscriptions'
import generateMutation from './mutation'
import type {GlobalPreCallback, graphqlSchemaDeclarationType, MutationList, SequelizeModels, Types} from '../allTypes'

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
  customMutations: MutationList
  globalPreCallback?: GlobalPreCallback
  pubSubInstance: PubSub | null
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

  return definition
}
