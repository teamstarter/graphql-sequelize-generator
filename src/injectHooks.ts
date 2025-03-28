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

// Injects a function that will be called with the model and the hooks
// The function can return a new list of hooks to be used instead of the original ones
export function injectHooks({
  graphqlSchemaDeclaration,
  injectFunctions,
}: InjectHooksOptions): GraphqlSchemaDeclarationType<any> {
  for (const key in graphqlSchemaDeclaration) {
    const declaration = graphqlSchemaDeclaration[key]

    if ('model' in declaration) {
      if (!declaration.list) {
        declaration.list = {}
      }

      const beforeList: QueryBeforeHook<any>[] = Array.isArray(
        declaration.list.before
      )
        ? declaration.list.before
        : declaration.list.before
        ? [declaration.list.before as QueryBeforeHook<any>]
        : []

      declaration.list.before = injectFunctions.listBefore
        ? injectFunctions.listBefore(declaration.model, beforeList)
        : beforeList

      const afterList: QueryAfterHook<any>[] = Array.isArray(
        declaration.list.after
      )
        ? declaration.list.after
        : declaration.list.after
        ? [declaration.list.after as QueryAfterHook<any>]
        : []

      declaration.list.after = injectFunctions.listAfter
        ? injectFunctions.listAfter(declaration.model, afterList)
        : afterList

      // Initialize update configuration if it's in actions
      if (declaration.actions?.includes('update')) {
        if (!declaration.update || 'type' in declaration.update) {
          declaration.update = {} as UpdateFieldDeclarationType<any>
        }

        const beforeUpdate: UpdateBeforeHook<any>[] = Array.isArray(
          declaration.update.before
        )
          ? declaration.update.before
          : declaration.update.before
          ? [declaration.update.before as UpdateBeforeHook<any>]
          : []

        declaration.update.before = injectFunctions.updateBefore
          ? injectFunctions.updateBefore(declaration.model, beforeUpdate)
          : beforeUpdate

        const afterUpdate: UpdateAfterHook<any>[] = Array.isArray(
          declaration.update.after
        )
          ? declaration.update.after
          : declaration.update.after
          ? [declaration.update.after as UpdateAfterHook<any>]
          : []

        declaration.update.after = injectFunctions.updateAfter
          ? injectFunctions.updateAfter(declaration.model, afterUpdate)
          : afterUpdate
      }

      // Initialize create configuration if it's in actions
      if (declaration.actions?.includes('create')) {
        if (!declaration.create || 'type' in declaration.create) {
          declaration.create = {} as CreateFieldDeclarationType<any>
        }

        const beforeCreate: CreateBeforeHook<any>[] = Array.isArray(
          declaration.create.before
        )
          ? declaration.create.before
          : declaration.create.before
          ? [declaration.create.before as CreateBeforeHook<any>]
          : []

        declaration.create.before = injectFunctions.createBefore
          ? injectFunctions.createBefore(declaration.model, beforeCreate)
          : beforeCreate

        const afterCreate: CreateAfterHook<any>[] = Array.isArray(
          declaration.create.after
        )
          ? declaration.create.after
          : declaration.create.after
          ? [declaration.create.after as CreateAfterHook<any>]
          : []

        declaration.create.after = injectFunctions.createAfter
          ? injectFunctions.createAfter(declaration.model, afterCreate)
          : afterCreate
      }

      // Initialize delete configuration if it's in actions
      if (declaration.actions?.includes('delete')) {
        if (!declaration.delete || 'type' in declaration.delete) {
          declaration.delete = {} as DeleteFieldDeclarationType<any>
        }

        const beforeDelete: DeleteBeforeHook<any>[] = Array.isArray(
          declaration.delete.before
        )
          ? declaration.delete.before
          : declaration.delete.before
          ? [declaration.delete.before as DeleteBeforeHook<any>]
          : []

        declaration.delete.before = injectFunctions.deleteBefore
          ? injectFunctions.deleteBefore(declaration.model, beforeDelete)
          : beforeDelete

        const afterDelete: DeleteAfterHook<any>[] = Array.isArray(
          declaration.delete.after
        )
          ? declaration.delete.after
          : declaration.delete.after
          ? [declaration.delete.after as DeleteAfterHook<any>]
          : []

        declaration.delete.after = injectFunctions.deleteAfter
          ? injectFunctions.deleteAfter(declaration.model, afterDelete)
          : afterDelete
      }
    }
  }

  return graphqlSchemaDeclaration
}
