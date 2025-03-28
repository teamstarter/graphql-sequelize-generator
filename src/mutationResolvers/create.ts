import {
  GraphQLFieldConfig,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql'
import { PubSub } from 'graphql-subscriptions'
import { Model, ModelStatic } from 'sequelize'
import {
  CreateAfterHook,
  CreateBeforeHook,
  GlobalBeforeHook,
  ModelDeclarationType,
} from '../types/types'
import setWebhookData from '../webhook/setWebhookData'
import callModelWebhook from './callModelWebhook'

/**
 * Generates a create mutation operation
 *
 * @param {String} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} model
 * @param {*} graphqlModelDeclaration
 * @param {PubSub} pubSubInstance
 */
export default function generateMutationCreate<M extends Model<any>>(
  modelName: string,
  inputType: GraphQLInputObjectType,
  outputType: GraphQLObjectType,
  model: ModelStatic<M>,
  graphqlModelDeclaration: ModelDeclarationType<M>,
  globalPreCallback: any,
  pubSubInstance: PubSub | null = null,
  callWebhook: Function
): GraphQLFieldConfig<any, any, { [key: string]: any }> {
  return {
    type: outputType,
    description: `Create a ${modelName}`,
    args: {
      [modelName]: { type: new GraphQLNonNull(inputType) },
      ...(graphqlModelDeclaration.create &&
      'extraArg' in graphqlModelDeclaration.create &&
      graphqlModelDeclaration.create.extraArg
        ? graphqlModelDeclaration.create.extraArg
        : {}),
    },
    resolve: async (
      source: any,
      args: any,
      context: any,
      info: any
    ): Promise<M | undefined> => {
      let attributes = args[modelName]

      if (graphqlModelDeclaration.before) {
        const beforeList: GlobalBeforeHook[] = Array.isArray(
          graphqlModelDeclaration.before
        )
          ? graphqlModelDeclaration.before
          : [graphqlModelDeclaration.before as GlobalBeforeHook]

        for (const before of beforeList) {
          const handle = globalPreCallback('createGlobalBefore')
          await before({ args, context, info })
          if (handle) {
            handle()
          }
        }
      }

      if (
        graphqlModelDeclaration.create &&
        'before' in graphqlModelDeclaration.create &&
        graphqlModelDeclaration.create.before
      ) {
        const beforeCreate: CreateBeforeHook<M>[] = Array.isArray(
          graphqlModelDeclaration.create.before
        )
          ? graphqlModelDeclaration.create.before
          : [graphqlModelDeclaration.create.before as CreateBeforeHook<M>]

        for (const before of beforeCreate) {
          const beforeHandle = globalPreCallback('createBefore')
          attributes = await before({
            source,
            args,
            context,
            info,
          })

          // The return value of the before hook is used as the attributes for the next hook
          args[modelName] = attributes

          if (!attributes) {
            throw new Error(
              'The before hook must always return the create method first parameter.'
            )
          }

          if (beforeHandle) {
            beforeHandle()
          }
        }
      }

      if (
        graphqlModelDeclaration.create &&
        'preventDuplicateOnAttributes' in graphqlModelDeclaration.create &&
        graphqlModelDeclaration.create.preventDuplicateOnAttributes
      ) {
        const preventDuplicateAttributes =
          graphqlModelDeclaration.create.preventDuplicateOnAttributes
        const filters = Object.keys(attributes).reduce(
          (acc: any, key: string) => {
            if (preventDuplicateAttributes.includes(key)) {
              acc[key] = attributes[key] ? attributes[key] : null
            }

            return acc
          },
          {}
        )

        let entityDuplicate: M | null = null
        if (Object.keys(filters).length) {
          entityDuplicate = await model.findOne({
            where: filters,
          })
        }

        if (entityDuplicate) {
          return entityDuplicate
        }
      }

      let newEntity: M | undefined = undefined
      try {
        newEntity = await model.create(attributes)
      } catch (error) {
        if (error instanceof Error) {
          throw error
        }
        throw new Error('Unknown error occurred while creating entity')
      }

      if (!newEntity) {
        return undefined
      }

      if (
        graphqlModelDeclaration.create &&
        'after' in graphqlModelDeclaration.create &&
        graphqlModelDeclaration.create.after
      ) {
        const afterList: CreateAfterHook<M>[] = Array.isArray(
          graphqlModelDeclaration.create.after
        )
          ? graphqlModelDeclaration.create.after
          : [graphqlModelDeclaration.create.after as CreateAfterHook<M>]

        let createdEntity = newEntity
        const hookData = { data: createdEntity.get({ plain: true }) }
        for (const after of afterList) {
          const afterHandle = globalPreCallback('createAfter')
          createdEntity = await after({
            createdEntity,
            source,
            args,
            context,
            info,
            setWebhookData: setWebhookData(hookData),
          })
          if (afterHandle) {
            afterHandle()
          }
        }

        if (pubSubInstance) {
          pubSubInstance.publish(`${modelName}Created`, {
            [`${modelName}Created`]: createdEntity.get(),
          })
        }

        await callModelWebhook(
          modelName,
          graphqlModelDeclaration.webhooks,
          'create',
          context,
          hookData.data,
          callWebhook
        )

        return createdEntity
      }

      if (pubSubInstance) {
        pubSubInstance.publish(`${modelName}Created`, {
          [`${modelName}Created`]: newEntity.get(),
        })
      }

      await callModelWebhook(
        modelName,
        graphqlModelDeclaration.webhooks,
        'create',
        context,
        { ...newEntity.get({ plain: true }) },
        callWebhook
      )

      return newEntity
    },
  }
}
