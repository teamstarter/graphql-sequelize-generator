import { PubSub } from 'graphql-subscriptions'
import { GraphQLInt, GraphQLNonNull } from 'graphql'

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
  graphqlModelDeclaration: any,
  models: any,
  globalPreCallback: any,
  pubSubInstance: PubSub | null = new PubSub()
) {
  return {
    type: GraphQLInt,
    description: `Delete a ${modelName}`,
    args: {
      id: { type: new GraphQLNonNull(GraphQLInt) },
      ...(graphqlModelDeclaration.delete &&
      graphqlModelDeclaration.delete.extraArg
        ? graphqlModelDeclaration.delete.extraArg
        : {})
    },
    resolve: async (source: any, args: any, context: any, info: any) => {
      let where = { id: args.id }

      if (graphqlModelDeclaration.before) {
        const beforeList =
          typeof graphqlModelDeclaration.before.length !== 'undefined'
            ? graphqlModelDeclaration.before
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

      const entity = await models[modelName].findOne({ where })

      if (!entity) {
        throw new Error(`${modelName} not found.`)
      }

      const rowDeleted = await graphqlModelDeclaration.model.destroy({
        where
      }) // Returns the number of rows affected (0 or 1)

      if (pubSubInstance) {
        pubSubInstance.publish(`${modelName}Deleted`, {
          [`${modelName}Deleted`]: entity.get()
        })
      }

      if (
        graphqlModelDeclaration.delete &&
        graphqlModelDeclaration.delete.after
      ) {
        const afterHandle = globalPreCallback('deleteAfter')
        await graphqlModelDeclaration.delete.after(
          entity,
          source,
          args,
          context,
          info
        )
        if (afterHandle) {
          afterHandle()
        }
      }
      return rowDeleted
    }
  }
}
