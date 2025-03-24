import { GraphQLFieldConfig, GraphQLInt, GraphQLNonNull } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { Filterable, FindOptions, Model } from 'sequelize'
import {
  DeleteAfterHook,
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
export default function generateMutationDelete<M extends Model<any>>(
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
        'before' in graphqlModelDeclaration.delete &&
        graphqlModelDeclaration.delete.before
      ) {
        const beforeList: DeleteBeforeHook<M>[] = Array.isArray(
          graphqlModelDeclaration.delete.before
        )
          ? graphqlModelDeclaration.delete.before
          : [graphqlModelDeclaration.delete.before as DeleteBeforeHook<M>]

        for (const before of beforeList) {
          const beforeHandle = globalPreCallback('deleteBefore')
          const result = await before({
            where,
            source,
            args,
            context,
            info,
          })
          if (result) {
            where = result
          }
          if (beforeHandle) {
            beforeHandle()
          }
        }
      }

      const entity = await models[modelName].findOne({
        where,
      } as FindOptions<M>)

      if (!entity) {
        throw new Error(`${modelName} not found.`)
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
        'after' in graphqlModelDeclaration.delete &&
        graphqlModelDeclaration.delete.after
      ) {
        const hookData = { data: { ...snapshotBeforeDelete } }

        const afterList: DeleteAfterHook<M>[] = Array.isArray(
          graphqlModelDeclaration.delete.after
        )
          ? graphqlModelDeclaration.delete.after
          : [graphqlModelDeclaration.delete.after as DeleteAfterHook<M>]

        for (const after of afterList) {
          const afterHandle = globalPreCallback('deleteAfter')
          await after({
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
