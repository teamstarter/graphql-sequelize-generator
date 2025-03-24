import { argsToFindOptions } from 'graphql-sequelize'
import { GroupedCountResultItem, Model, ModelStatic } from 'sequelize'
import {
  CountAfterHook,
  GlobalBeforeHook,
  GlobalPreCallback,
  ModelDeclarationType,
  QueryBeforeHook,
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
      const beforeList: GlobalBeforeHook[] = Array.isArray(
        schemaDeclaration.before
      )
        ? schemaDeclaration.before
        : [schemaDeclaration.before as GlobalBeforeHook]

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
      const beforeList: QueryBeforeHook<M>[] = Array.isArray(countBefore)
        ? countBefore
        : [countBefore as QueryBeforeHook<M>]

      for (const before of beforeList) {
        const handle = globalPreCallback('countBefore')
        const resultBefore = await before({
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
      }
    }

    const count = await model.count(findOptions)

    if (schemaDeclaration.count && schemaDeclaration.count.after) {
      const afterList: CountAfterHook<M>[] = Array.isArray(
        schemaDeclaration.count.after
      )
        ? schemaDeclaration.count.after
        : [schemaDeclaration.count.after as CountAfterHook<M>]

      let modifiedCount: number | GroupedCountResultItem[] = count
      for (const after of afterList) {
        const handle = globalPreCallback('countAfter')
        modifiedCount = await after({
          result: modifiedCount,
          args,
          context,
          info,
        })
        if (handle) {
          handle()
        }
      }
      return modifiedCount
    }

    return count
  }
}
