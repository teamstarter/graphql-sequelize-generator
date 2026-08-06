import _debug from 'debug'
import { GraphQLSchemaConfig } from 'graphql'
import { PubSub } from 'graphql-subscriptions'

import injectAssociations from './associations/inject'
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

  /**
   * Apply `excludeFields` to every declared model, including the ones nothing
   * else reaches.
   *
   * `excludeFields` is not a property of the output type — it is applied by
   * `injectAssociations`, and only two things call that: `queryResolvers/list`
   * for models with a root query, and `associations/field` for models some
   * other declared model points at. A model with `excludeFromRoot: true` that
   * is nobody's association target is reached by neither, so its type keeps
   * every raw column that `generateModelTypes` built from the model.
   *
   * That is invisible until such a type is referenced some other way — a
   * custom mutation's return type, a custom endpoint's type — and then it
   * appears unfiltered. It bites hardest with `filterDeclarationByProfile`,
   * where narrowing a declaration could leave a type LESS filtered than the
   * full schema had it.
   *
   * Running last means the two paths above have already done their work, so
   * this only catches what they could not, and existing schemas are unchanged.
   * The types are mutated in place and `new GraphQLSchema()` has not been
   * called yet, so the definition above picks this up.
   */
  Object.values(graphqlSchemaDeclaration).forEach((declaration: any) => {
    const modelName = declaration && declaration.model && declaration.model.name
    const outputType = modelName ? types.outputTypes[modelName] : null

    if (!outputType || (outputType as any).associationsInjected) {
      return
    }

    injectAssociations(
      outputType,
      graphqlSchemaDeclaration,
      types.outputTypes,
      models,
      globalPreCallback
    )
  })

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
