import { PubSub } from 'graphql-subscriptions'
import {
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType
} from 'graphql'

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
export default function generateMutationCreate(
  modelName: string,
  inputType: GraphQLInputObjectType,
  outputType: GraphQLObjectType,
  model: any,
  graphqlModelDeclaration: any,
  globalPreCallback: any,
  pubSubInstance: PubSub | null = null
) {
  return {
    type: outputType, // what is returned by resolve, must be of type GraphQLObjectType
    description: `Create a ${modelName}`,
    args: {
      [modelName]: { type: new GraphQLNonNull(inputType) },
      ...(graphqlModelDeclaration.create &&
      graphqlModelDeclaration.create.extraArg
        ? graphqlModelDeclaration.create.extraArg
        : {})
    },
    resolve: async (source: any, args: any, context: any, info: any) => {
      let attributes = args[modelName]

      if (graphqlModelDeclaration.before) {
        const beforeList =
          typeof graphqlModelDeclaration.before.length !== 'undefined'
            ? graphqlModelDeclaration.before
            : [graphqlModelDeclaration.before]

        for (const before of beforeList) {
          const handle = globalPreCallback('createGlobalBefore')
          await before(args, context, info)
          if (handle) {
            handle()
          }
        }
      }

      if (
        graphqlModelDeclaration.create &&
        graphqlModelDeclaration.create.before
      ) {
        const beforeHandle = globalPreCallback('createBefore')
        attributes = await graphqlModelDeclaration.create.before(
          source,
          args,
          context,
          info
        )

        if (!attributes) {
          throw new Error(
            'The before hook must always return the create method first parameter.'
          )
        }

        if (beforeHandle) {
          beforeHandle()
        }
      }

      if (
        graphqlModelDeclaration.create &&
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

        let entityDuplicate = null
        if (Object.keys(filters).length) {
          entityDuplicate = await model.findOne({
            where: filters
          })
        }

        if (entityDuplicate) {
          return entityDuplicate
        }
      }

      const newEntity = await model.create(attributes)

      if (
        graphqlModelDeclaration.create &&
        graphqlModelDeclaration.create.after
      ) {
        const afterHandle = globalPreCallback('createAfter')
        const updatedEntity = await graphqlModelDeclaration.create.after(
          newEntity,
          source,
          args,
          context,
          info
        )
        if (afterHandle) {
          afterHandle()
        }

        if (pubSubInstance) {
          pubSubInstance.publish(`${modelName}Created`, {
            [`${modelName}Created`]: updatedEntity.get()
          })
        }

        return updatedEntity
      }

      if (pubSubInstance) {
        pubSubInstance.publish(`${modelName}Created`, {
          [`${modelName}Created`]: newEntity.get()
        })
      }

      return newEntity
    }
  }
}
