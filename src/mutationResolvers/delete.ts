import { GraphQLFieldConfig, GraphQLInt, GraphQLNonNull } from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { Model } from 'sequelize'
import {
  GlobalBeforeHook,
  ModelDeclarationType,
  TArgs,
  TContext,
  TSource,
} from '../types/types'
import setWebhookData from '../webhook/setWebhookData'
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
export default function generateMutationDelete(
  modelName: string,
  graphqlModelDeclaration: ModelDeclarationType<any>,
  models: any,
  globalPreCallback: any,
  pubSubInstance: PubSub | null = null,
  callWebhook: Function
) {
  return {
    type: GraphQLInt,
    description: `Delete a ${modelName}`,
    args: {
      id: { type: new GraphQLNonNull(GraphQLInt) },
      ...(graphqlModelDeclaration.delete &&
      'extraArg' in graphqlModelDeclaration.delete &&
      graphqlModelDeclaration.delete.extraArg
        ? (graphqlModelDeclaration.delete.extraArg as object)
        : {}),
    },
    resolve: async (source, args, context, info) => {
      let where = { id: args.id }

      if (graphqlModelDeclaration.before) {
        const beforeList: GlobalBeforeHook[] =
          'length' in graphqlModelDeclaration.before
            ? (graphqlModelDeclaration.before as GlobalBeforeHook[])
            : [graphqlModelDeclaration.before]

        for (const before of beforeList) {
          const handle = globalPreCallback('deleteGlobalBefore')
          await before(args, context, info)
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
        const beforeHandle = globalPreCallback('deleteBefore')
        where = await graphqlModelDeclaration.delete.before(
          where,
          source,
          args,
          context,
          info
        )
        if (beforeHandle) {
          beforeHandle()
        }
      }

      const entity: Model = await models[modelName].findOne({ where })
      const snapshotBeforeDelete = { ...entity.get({ plain: true }) }

      if (!entity) {
        throw new Error(`${modelName} not found.`)
      }

      const rowDeleted = await graphqlModelDeclaration.model.destroy({
        where,
      }) // Returns the number of rows affected (0 or 1)

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

        const afterHandle = globalPreCallback('deleteAfter')
        await graphqlModelDeclaration.delete.after(
          entity,
          source,
          args,
          context,
          info,
          setWebhookData(hookData)
        )
        if (afterHandle) {
          afterHandle()
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

      return rowDeleted
    },
  } as GraphQLFieldConfig<TSource, TContext, TArgs>
}
