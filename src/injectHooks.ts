import { Model } from 'sequelize'
import {
  CreateAfterHook,
  CreateBeforeHook,
  CreateFieldDeclarationType,
  DeleteAfterHook,
  DeleteBeforeHook,
  DeleteFieldDeclarationType,
  GraphqlSchemaDeclarationType,
  InjectHooksOptions,
  QueryAfterHook,
  QueryBeforeHook,
  UpdateAfterHook,
  UpdateBeforeHook,
  UpdateFieldDeclarationType,
} from './types/types'

function injectListHooks<T extends Model<any, any>>(
  declaration: any,
  injectFunctions: InjectHooksOptions['injectFunctions']
) {
  if (!declaration.list) {
    declaration.list = {}
  }

  // If the list is resolved by a custom function, we don't need to inject hooks
  if (declaration?.list?.resolve) {
    return
  }

  const beforeList: QueryBeforeHook<T>[] = Array.isArray(
    declaration.list.before
  )
    ? declaration.list.before
    : declaration.list.before
    ? [declaration.list.before as QueryBeforeHook<T>]
    : []

  declaration.list.before = injectFunctions.listBefore
    ? injectFunctions.listBefore(declaration.model, beforeList)
    : beforeList

  const afterList: QueryAfterHook<T>[] = Array.isArray(declaration.list.after)
    ? declaration.list.after
    : declaration.list.after
    ? [declaration.list.after as QueryAfterHook<T>]
    : []

  declaration.list.after = injectFunctions.listAfter
    ? injectFunctions.listAfter(declaration.model, afterList)
    : afterList
}

function injectUpdateHooks<T extends Model<any, any>>(
  declaration: any,
  injectFunctions: InjectHooksOptions['injectFunctions']
) {
  if (!declaration.actions?.includes('update')) return

  // If the update is resolved by a custom function, we don't need to inject hooks
  if (declaration?.update?.resolve) {
    return
  }

  if (!declaration.update) {
    declaration.update = {} as UpdateFieldDeclarationType<T>
  }

  const beforeUpdate: UpdateBeforeHook<T>[] = Array.isArray(
    declaration.update.before
  )
    ? declaration.update.before
    : declaration.update.before
    ? [declaration.update.before as UpdateBeforeHook<T>]
    : []

  declaration.update.before = injectFunctions.updateBefore
    ? injectFunctions.updateBefore(declaration.model, beforeUpdate)
    : beforeUpdate

  const afterUpdate: UpdateAfterHook<T>[] = Array.isArray(
    declaration.update.after
  )
    ? declaration.update.after
    : declaration.update.after
    ? [declaration.update.after as UpdateAfterHook<T>]
    : []

  declaration.update.after = injectFunctions.updateAfter
    ? injectFunctions.updateAfter(declaration.model, afterUpdate)
    : afterUpdate
}

function injectCreateHooks<T extends Model<any, any>>(
  declaration: any,
  injectFunctions: InjectHooksOptions['injectFunctions']
) {
  if (!declaration.actions?.includes('create')) return

  // If the create is resolved by a custom function, we don't need to inject hooks
  if (declaration?.create?.resolve) {
    return
  }

  if (!declaration.create) {
    declaration.create = {} as CreateFieldDeclarationType<T>
  }

  const beforeCreate: CreateBeforeHook<T>[] = Array.isArray(
    declaration.create.before
  )
    ? declaration.create.before
    : declaration.create.before
    ? [declaration.create.before as CreateBeforeHook<T>]
    : []

  declaration.create.before = injectFunctions.createBefore
    ? injectFunctions.createBefore(declaration.model, beforeCreate)
    : beforeCreate

  const afterCreate: CreateAfterHook<T>[] = Array.isArray(
    declaration.create.after
  )
    ? declaration.create.after
    : declaration.create.after
    ? [declaration.create.after as CreateAfterHook<T>]
    : []

  declaration.create.after = injectFunctions.createAfter
    ? injectFunctions.createAfter(declaration.model, afterCreate)
    : afterCreate
}

function injectDeleteHooks<T extends Model<any, any>>(
  declaration: any,
  injectFunctions: InjectHooksOptions['injectFunctions']
) {
  if (!declaration.actions?.includes('delete')) return

  // If the delete is resolved by a custom function, we don't need to inject hooks
  if (declaration?.delete?.resolve) {
    return
  }

  if (!declaration.delete) {
    declaration.delete = {} as DeleteFieldDeclarationType<T>
  }

  const beforeDelete: DeleteBeforeHook<T>[] = Array.isArray(
    declaration.delete.before
  )
    ? declaration.delete.before
    : declaration.delete.before
    ? [declaration.delete.before as DeleteBeforeHook<T>]
    : []

  declaration.delete.before = injectFunctions.deleteBefore
    ? injectFunctions.deleteBefore(declaration.model, beforeDelete)
    : beforeDelete

  const afterDelete: DeleteAfterHook<T>[] = Array.isArray(
    declaration.delete.after
  )
    ? declaration.delete.after
    : declaration.delete.after
    ? [declaration.delete.after as DeleteAfterHook<T>]
    : []

  declaration.delete.after = injectFunctions.deleteAfter
    ? injectFunctions.deleteAfter(declaration.model, afterDelete)
    : afterDelete
}

// Injects a function that will be called with the model and the hooks
// The function can return a new list of hooks to be used instead of the original ones
export function injectHooks({
  graphqlSchemaDeclaration,
  injectFunctions,
}: InjectHooksOptions): GraphqlSchemaDeclarationType<any> {
  for (const key in graphqlSchemaDeclaration) {
    const declaration = graphqlSchemaDeclaration[key]

    if ('model' in declaration) {
      injectListHooks(declaration, injectFunctions)
      injectUpdateHooks(declaration, injectFunctions)
      injectCreateHooks(declaration, injectFunctions)
      injectDeleteHooks(declaration, injectFunctions)
    }
  }

  return graphqlSchemaDeclaration
}
