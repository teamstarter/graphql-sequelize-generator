import { argsToFindOptions } from 'graphql-sequelize'
import {
  GlobalBeforeHook,
  GlobalPreCallback,
  ModelDeclarationType,
  SequelizeModel,
} from '../../types'

export default function countResolver(
  model: SequelizeModel,
  schemaDeclaration: ModelDeclarationType,
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
        await before(args, context, info)
        if (handle) {
          handle()
        }
      }
    }

    if (typeof countBefore !== 'undefined') {
      const handle = globalPreCallback('countBefore')
      const countOptions = await countBefore(
        argsToFindOptions.default(args, Object.keys(model.rawAttributes)),
        args,
        context,
        info
      )
      if (handle) {
        handle()
      }
      return model.count(countOptions)
    }
    return model.count(
      argsToFindOptions.default(args, Object.keys(model.rawAttributes))
    )
  }
}
