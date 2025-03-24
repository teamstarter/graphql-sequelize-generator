import {
  GraphQLFieldConfig,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { Model } from 'sequelize'
import {
  GlobalBeforeHook,
  ModelDeclarationType,
  SequelizeModels,
  UpdateAfterHook,
  UpdateBeforeHook,
} from '../types/types'
import callModelWebhook from './callModelWebhook'

/**
 * Generates a update mutation operation
 *
 * @param {string} modelName Name of the generated model
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} model
 * @param {*} graphqlModelDeclaration
 * @param {*} models
 * @param {PubSub} pubSubInstance
 */
export default function generateMutationUpdate<M extends Model<any>>(
  modelName: string,
  inputType: GraphQLInputObjectType,
  outputType: GraphQLObjectType,
  graphqlModelDeclaration: ModelDeclarationType<M>,
  models: SequelizeModels,
  globalPreCallback: any,
  pubSubInstance: PubSub | null = null,
  callWebhook: Function
): GraphQLFieldConfig<any, any, { [key: string]: any }> {
  return {
    type: outputType,
    description: `Update a ${modelName}`,
    args: {
      [modelName]: { type: new GraphQLNonNull(inputType) },
      ...(graphqlModelDeclaration.update &&
      'extraArg' in graphqlModelDeclaration.update &&
      graphqlModelDeclaration.update.extraArg
        ? (graphqlModelDeclaration.update.extraArg as object)
        : {}),
    },
    resolve: async (source: any, args: any, context: any, info: any) => {
      let data = args[modelName]

      if (graphqlModelDeclaration.before) {
        const beforeList: GlobalBeforeHook[] = Array.isArray(
          graphqlModelDeclaration.before
        )
          ? graphqlModelDeclaration.before
          : [graphqlModelDeclaration.before as GlobalBeforeHook]

        for (const before of beforeList) {
          const handle = globalPreCallback('updateGlobalBefore')
          await before({ args, context, info })
          if (handle) {
            handle()
          }
        }
      }

      if (
        graphqlModelDeclaration.update &&
        'before' in graphqlModelDeclaration.update &&
        graphqlModelDeclaration.update.before
      ) {
        const beforeList: UpdateBeforeHook<M>[] = Array.isArray(
          graphqlModelDeclaration.update.before
        )
          ? graphqlModelDeclaration.update.before
          : [graphqlModelDeclaration.update.before as UpdateBeforeHook<M>]

        for (const before of beforeList) {
          const beforeHandle = globalPreCallback('updateBefore')
          data = await before({
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

      const entity = await models[modelName].findOne({ where: { id: data.id } })

      if (!entity) {
        throw new Error(`${modelName} not found.`)
      }

      const snapshotBeforeUpdate = { ...entity.get({ plain: true }) }
      await entity.update(data)
      await entity.reload()

      if (
        graphqlModelDeclaration.update &&
        'after' in graphqlModelDeclaration.update &&
        graphqlModelDeclaration.update.after
      ) {
        const hookData = {
          data: {
            new: { ...entity.get({ plain: true }) },
            old: { ...snapshotBeforeUpdate },
          },
        }

        const afterList: UpdateAfterHook<M>[] = Array.isArray(
          graphqlModelDeclaration.update.after
        )
          ? graphqlModelDeclaration.update.after
          : [graphqlModelDeclaration.update.after as UpdateAfterHook<M>]

        let updatedEntity = entity
        for (const after of afterList) {
          const afterHandle = globalPreCallback('updateAfter')
          updatedEntity = await after({
            updatedEntity,
            entitySnapshot: snapshotBeforeUpdate,
            source,
            args,
            context,
            info,
          })
          if (afterHandle) {
            afterHandle()
          }
        }

        if (pubSubInstance) {
          pubSubInstance.publish(`${modelName}Updated`, {
            [`${modelName}Updated`]: updatedEntity.get(),
          })
        }

        await callModelWebhook(
          modelName,
          graphqlModelDeclaration.webhooks,
          'update',
          context,
          hookData.data,
          callWebhook
        )

        return updatedEntity
      }

      if (pubSubInstance) {
        pubSubInstance.publish(`${modelName}Updated`, {
          [`${modelName}Updated`]: entity.get(),
        })
      }

      await callModelWebhook(
        modelName,
        graphqlModelDeclaration.webhooks,
        'update',
        context,
        {
          new: { ...entity.get({ plain: true }) },
          old: { ...snapshotBeforeUpdate },
        },
        callWebhook
      )

      return entity
    },
  }
}
