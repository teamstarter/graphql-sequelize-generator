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
  MinimumUpdateProperties,
  ModelDeclarationType,
  SequelizeModels,
  UpdateAfterHook,
  UpdateBeforeFetchHook,
  UpdateBeforeHook,
} from '../types/types'
import callModelWebhook from './callModelWebhook'
import runMutation, { validateTransactionDeclaration } from './runMutation'

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
  validateTransactionDeclaration(modelName, graphqlModelDeclaration, 'update')

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
    resolve: async (source: any, args: any, context: any, info: any) =>
      // When the declaration is transactional, everything below — the hooks,
      // the fetch, the write and the reload — runs inside one transaction.
      // pubSub and the webhook run in `afterCommit`, once the write is durable.
      runMutation<M, M>(
        models[modelName],
        graphqlModelDeclaration,
        'update',
        async (transaction) => {
          let data: MinimumUpdateProperties<M> = args[modelName]

          if (graphqlModelDeclaration.before) {
            const beforeList: GlobalBeforeHook[] = Array.isArray(
              graphqlModelDeclaration.before
            )
              ? graphqlModelDeclaration.before
              : [graphqlModelDeclaration.before as GlobalBeforeHook]

            for (const before of beforeList) {
              const handle = globalPreCallback('updateGlobalBefore')
              await before({ args, context, info, transaction })
              if (handle) {
                handle()
              }
            }
          }

          if (
            graphqlModelDeclaration.update &&
            'beforeUpdateFetch' in graphqlModelDeclaration.update &&
            graphqlModelDeclaration.update.beforeUpdateFetch
          ) {
            const beforeList: UpdateBeforeFetchHook<M>[] = Array.isArray(
              graphqlModelDeclaration.update.beforeUpdateFetch
            )
              ? graphqlModelDeclaration.update.beforeUpdateFetch
              : [
                  graphqlModelDeclaration.update
                    .beforeUpdateFetch as UpdateBeforeFetchHook<M>,
                ]

            for (const before of beforeList) {
              const beforeHandle = globalPreCallback('beforeUpdateFetch')
              data = await before({
                source,
                args,
                context,
                info,
                transaction,
              })

              // The return value of the before hook is used as the attributes for the next hook
              args[modelName] = data

              if (beforeHandle) {
                beforeHandle()
              }
            }
          }

          const entity = await models[modelName].findOne({
            where: { id: data.id },
            transaction,
          })

          if (!entity) {
            throw new Error(`${modelName} not found.`)
          }

          if (
            graphqlModelDeclaration.update &&
            'beforeUpdate' in graphqlModelDeclaration.update &&
            graphqlModelDeclaration.update.beforeUpdate
          ) {
            const beforeList: UpdateBeforeHook<M>[] = Array.isArray(
              graphqlModelDeclaration.update.beforeUpdate
            )
              ? graphqlModelDeclaration.update.beforeUpdate
              : [
                  graphqlModelDeclaration.update
                    .beforeUpdate as UpdateBeforeHook<M>,
                ]

            for (const before of beforeList) {
              const beforeHandle = globalPreCallback('beforeUpdate')
              data = await before({
                entity,
                source,
                args,
                context,
                info,
                transaction,
              })

              if (beforeHandle) {
                beforeHandle()
              }
            }
          }

          const snapshotBeforeUpdate = { ...entity.get({ plain: true }) }
          await entity.update(data, { transaction })
          await entity.reload({ transaction })

          if (
            graphqlModelDeclaration.update &&
            'afterUpdate' in graphqlModelDeclaration.update &&
            graphqlModelDeclaration.update.afterUpdate
          ) {
            const hookData = {
              data: {
                new: { ...entity.get({ plain: true }) },
                old: { ...snapshotBeforeUpdate },
              },
            }

            const afterList: UpdateAfterHook<M>[] = Array.isArray(
              graphqlModelDeclaration.update.afterUpdate
            )
              ? graphqlModelDeclaration.update.afterUpdate
              : [
                  graphqlModelDeclaration.update
                    .afterUpdate as UpdateAfterHook<M>,
                ]

            let updatedEntity = entity
            for (const after of afterList) {
              const afterHandle = globalPreCallback('updateAfter')
              updatedEntity = await after({
                updatedEntity,
                previousPropertiesSnapshot: snapshotBeforeUpdate,
                source,
                args,
                context,
                info,
                transaction,
              })
              if (afterHandle) {
                afterHandle()
              }
            }

            return {
              result: updatedEntity,
              afterCommit: async () => {
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
              },
            }
          }

          return {
            result: entity,
            afterCommit: async () => {
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
            },
          }
        }
      ),
  }
}
