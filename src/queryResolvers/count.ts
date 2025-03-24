import { argsToFindOptions } from 'graphql-sequelize'
import { Model, ModelStatic } from 'sequelize'
import {
  GlobalBeforeHook,
  GlobalPreCallback,
  ModelDeclarationType,
} from '../types/types'

export default function countResolver<M extends Model<any>>(
  model: ModelStatic<M>,
  schemaDeclaration: ModelDeclarationType<M>,
  globalPreCallback: GlobalPreCallback
) {
  const countResolver =
    schemaDeclaration.count && schemaDeclaration.count.resolver
      ? schemaDeclaration.count.resolver
      : undefined

  if (countResolver) {
    return countResolver
  }

  const listBefore =
    schemaDeclaration.list && schemaDeclaration.list.before
      ? schemaDeclaration.list.before
      : undefined

  // Count uses the same before function as the list, except if specified otherwise
  const countBefore =
    schemaDeclaration.count && schemaDeclaration.count.before
      ? schemaDeclaration.count.before
      : listBefore

  return async (source: any, args: any, context: any, info: any) => {
    if (schemaDeclaration.before) {
      const beforeList: GlobalBeforeHook[] =
        schemaDeclaration.before &&
        typeof schemaDeclaration.before.length !== 'undefined'
          ? (schemaDeclaration.before as GlobalBeforeHook[])
          : ([schemaDeclaration.before] as GlobalBeforeHook[])

      for (const before of beforeList) {
        const handle = globalPreCallback('listGlobalBefore')
        await before({ args, context, info })
        if (handle) {
          handle()
        }
      }
    }

    let findOptions = argsToFindOptions.default(
      args,
      Object.keys(model.getAttributes())
    )

    if (countBefore) {
      const handle = globalPreCallback('countBefore')

      const resultBefore = await countBefore({
        findOptions,
        args,
        context,
        info,
      })
      if (!resultBefore) {
        throw new Error(
          'The before hook of the count endpoint must return a value.'
        )
      }
      findOptions = resultBefore
      if (handle) {
        handle()
      }
      return model.count(findOptions)
    }
    return model.count(findOptions)
  }
}
