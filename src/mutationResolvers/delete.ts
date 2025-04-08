import { GraphQLFieldConfig, GraphQLInt, GraphQLNonNull } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { Filterable, FindOptions, Model } from 'sequelize'
import {
  DeleteAfterHook,
  DeleteBeforeFetchHook,
  DeleteBeforeHook,
  GlobalBeforeHook,
  ModelDeclarationType,
  SequelizeModels,
} from '../types/types'
import callModelWebhook from './callModelWebhook'

/**
 * Generates a delete mutation operation
 *
 * @param {String} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} graphqlModelDeclaration
 * @param {*} models
 * @param {PubSub} pubSubInstance
 */
export default function generateMutationDelete<
  M extends Model<any>,
  TContext = any
>(
  modelName: string,
  graphqlModelDeclaration: ModelDeclarationType<M>,
  models: SequelizeModels,
  globalPreCallback: any,
  pubSubInstance: PubSub | null = null,
  callWebhook: Function
): GraphQLFieldConfig<any, any, { [key: string]: any }> {
  return {
    type: GraphQLInt,
    description: `Delete a ${modelName}`,
    args: {
      id: { type: new GraphQLNonNull(GraphQLInt) },
      ...(graphqlModelDeclaration.delete &&
      'extraArg' in graphqlModelDeclaration.delete &&
      graphqlModelDeclaration.delete.extraArg
        ? graphqlModelDeclaration.delete.extraArg
        : {}),
    },
    resolve: async (source, args, context, info) => {
      let where: Filterable<M> = { id: args.id } as Filterable<M>

      if (graphqlModelDeclaration.before) {
        const beforeList: GlobalBeforeHook[] = Array.isArray(
          graphqlModelDeclaration.before
        )
          ? graphqlModelDeclaration.before
          : [graphqlModelDeclaration.before as GlobalBeforeHook]

        for (const before of beforeList) {
          const handle = globalPreCallback('deleteGlobalBefore')
          await before({ args, context, info })
          if (handle) {
            handle()
          }
        }
      }

      if (
        graphqlModelDeclaration.delete &&
        'beforeDeleteFetch' in graphqlModelDeclaration.delete &&
        graphqlModelDeclaration.delete.beforeDeleteFetch
      ) {
        const beforeList: DeleteBeforeFetchHook<M>[] = Array.isArray(
          graphqlModelDeclaration.delete.beforeDeleteFetch
        )
          ? graphqlModelDeclaration.delete.beforeDeleteFetch
          : [
              graphqlModelDeclaration.delete
                .beforeDeleteFetch as DeleteBeforeFetchHook<M>,
            ]

        for (const before of beforeList) {
          const beforeHandle = globalPreCallback('beforeDeleteFetch')
          const result = await before({
            where,
            source,
            args,
            context,
            info,
          })

          // The return value of the before hook is used as the where for the next hook
          if (result) {
            where = result
          }

          if (beforeHandle) {
            beforeHandle()
          }
        }
      }

      let entity = await models[modelName].findOne({
        where,
      } as FindOptions<M>)

      if (!entity) {
        throw new Error(`${modelName} not found.`)
      }

      if (
        graphqlModelDeclaration.delete &&
        'beforeDelete' in graphqlModelDeclaration.delete &&
        graphqlModelDeclaration.delete.beforeDelete
      ) {
        const beforeList: DeleteBeforeHook<M, TContext>[] = Array.isArray(
          graphqlModelDeclaration.delete.beforeDelete
        )
          ? graphqlModelDeclaration.delete.beforeDelete
          : [
              graphqlModelDeclaration.delete.beforeDelete as DeleteBeforeHook<
                M,
                TContext
              >,
            ]

        for (const before of beforeList) {
          const beforeHandle = globalPreCallback('beforeDelete')
          entity = await before({
            entity,
            where,
            source,
            args,
            context,
            info,
          })

          if (beforeHandle) {
            beforeHandle()
          }
        }
      }

      const snapshotBeforeDelete = { ...entity.get({ plain: true }) }
      await entity.destroy()

      if (pubSubInstance) {
        pubSubInstance.publish(`${modelName}Deleted`, {
          [`${modelName}Deleted`]: entity.get(),
        })
      }

      if (
        graphqlModelDeclaration.delete &&
        'afterDelete' in graphqlModelDeclaration.delete &&
        graphqlModelDeclaration.delete.afterDelete
      ) {
        const hookData = { data: { ...snapshotBeforeDelete } }

        const afterList: DeleteAfterHook<M, TContext>[] = Array.isArray(
          graphqlModelDeclaration.delete.afterDelete
        )
          ? graphqlModelDeclaration.delete.afterDelete
          : [
              graphqlModelDeclaration.delete.afterDelete as DeleteAfterHook<
                M,
                TContext
              >,
            ]

        for (const after of afterList) {
          const afterHandle = globalPreCallback('afterDelete')
          entity = await after({
            deletedEntity: entity,
            source,
            args,
            context,
            info,
          })
          if (afterHandle) {
            afterHandle()
          }
        }

        await callModelWebhook(
          modelName,
          graphqlModelDeclaration.webhooks,
          'delete',
          context,
          hookData.data,
          callWebhook
        )
      }

      await callModelWebhook(
        modelName,
        graphqlModelDeclaration.webhooks,
        'delete',
        context,
        { ...snapshotBeforeDelete },
        callWebhook
      )

      return 1
    },
  }
}
