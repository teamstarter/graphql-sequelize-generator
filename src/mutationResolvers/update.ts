import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { GlobalBeforeHook, ModelDeclarationType } from '../types/types'
import setWebhookData from '../webhook/setWebhookData'
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
export default function generateMutationUpdate(
  modelName: string,
  inputType: GraphQLInputObjectType,
  outputType: GraphQLObjectType,
  graphqlModelDeclaration: ModelDeclarationType<any>,
  models: any,
  globalPreCallback: any,
  pubSubInstance: PubSub | null = null,
  callWebhook: Function
) {
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
        const beforeList: GlobalBeforeHook[] =
          typeof graphqlModelDeclaration.before.length !== 'undefined'
            ? (graphqlModelDeclaration.before as GlobalBeforeHook[])
            : ([graphqlModelDeclaration.before] as GlobalBeforeHook[])

        for (const before of beforeList) {
          const handle = globalPreCallback('updateGlobalBefore')
          await before(args, context, info)
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
        const beforeHandle = globalPreCallback('updateBefore')
        data = await graphqlModelDeclaration.update.before(
          source,
          args,
          context,
          info
        )
        if (beforeHandle) {
          beforeHandle()
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

        const afterHandle = globalPreCallback('updateAfter')
        const updatedEntity = await graphqlModelDeclaration.update.after(
          entity,
          snapshotBeforeUpdate,
          source,
          args,
          context,
          info,
          setWebhookData(hookData)
        )
        if (afterHandle) {
          afterHandle()
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
    },
  }
}
