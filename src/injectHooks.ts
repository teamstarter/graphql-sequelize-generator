import { GraphQLFieldConfig } from 'graphql'
import { Model } from 'sequelize'
import {
  CreateAfterHook,
  CreateBeforeHook,
  CreateFieldDeclarationType,
  DeleteAfterHook,
  DeleteBeforeFetchHook,
  DeleteBeforeHook,
  DeleteFieldDeclarationType,
  GraphqlSchemaDeclarationType,
  InjectHooksOptions,
  ModelDeclarationType,
  QueryAfterHook,
  QueryBeforeHook,
  UpdateAfterHook,
  UpdateBeforeFetchHook,
  UpdateBeforeHook,
  UpdateFieldDeclarationType,
} from './types/types'

function injectListHooks<T extends Model<any, any>>(
  sourceDeclaration:
    | ModelDeclarationType<any, any>
    | GraphQLFieldConfig<any, any, any>,
  injectFunctions: InjectHooksOptions['injectFunctions']
) {
  const declaration = { ...sourceDeclaration }

  // If the list is resolved by a custom function, we don't need to inject hooks
  if (
    'type' in declaration ||
    (declaration?.list && 'resolve' in declaration?.list)
  ) {
    return declaration
  }

  if (!declaration.list) {
    declaration.list = {}
  } else {
    declaration.list = { ...declaration.list }
  }

  const beforeList: QueryBeforeHook<T>[] = Array.isArray(
    declaration.list.beforeList
  )
    ? [...declaration.list.beforeList]
    : declaration.list.beforeList
    ? [declaration.list.beforeList as QueryBeforeHook<T>]
    : []

  declaration.list.beforeList = injectFunctions.listBefore
    ? injectFunctions.listBefore(declaration.model, beforeList)
    : beforeList

  const afterList: QueryAfterHook<T>[] = Array.isArray(
    declaration.list.afterList
  )
    ? [...declaration.list.afterList]
    : declaration.list.afterList
    ? [declaration.list.afterList as QueryAfterHook<T>]
    : []

  declaration.list.afterList = injectFunctions.listAfter
    ? injectFunctions.listAfter(declaration.model, afterList)
    : afterList

  return declaration
}

function injectUpdateHooks<T extends Model<any, any>>(
  sourceDeclaration:
    | ModelDeclarationType<any, any>
    | GraphQLFieldConfig<any, any, any>,
  injectFunctions: InjectHooksOptions['injectFunctions']
) {
  const declaration = { ...sourceDeclaration }

  if ('actions' in declaration && !declaration.actions?.includes('update'))
    return declaration

  // If the update is resolved by a custom function, we don't need to inject hooks
  if (
    'update' in declaration &&
    declaration?.update &&
    'resolve' in declaration?.update
  ) {
    return declaration
  }

  if (
    'type' in declaration ||
    (declaration?.update && 'resolve' in declaration?.update)
  ) {
    return declaration
  }

  if (
    'update' in declaration &&
    declaration?.update &&
    'resolve' in declaration?.update
  ) {
    return declaration
  }

  if (!declaration.update) {
    declaration.update = {}
  } else {
    declaration.update = { ...declaration.update }
  }

  declaration.update = declaration.update as UpdateFieldDeclarationType<T, any>

  const beforeUpdateFetch: UpdateBeforeFetchHook<T>[] = Array.isArray(
    declaration.update.beforeUpdateFetch
  )
    ? [...declaration.update.beforeUpdateFetch]
    : declaration.update.beforeUpdateFetch
    ? [declaration.update.beforeUpdateFetch as UpdateBeforeFetchHook<T>]
    : []

  declaration.update.beforeUpdateFetch = injectFunctions.updateBeforeFetch
    ? injectFunctions.updateBeforeFetch(declaration.model, beforeUpdateFetch)
    : beforeUpdateFetch

  const beforeUpdate: UpdateBeforeHook<T>[] = Array.isArray(
    declaration.update.beforeUpdate
  )
    ? [...declaration.update.beforeUpdate]
    : declaration.update.beforeUpdate
    ? [declaration.update.beforeUpdate as UpdateBeforeHook<T>]
    : []

  declaration.update.beforeUpdate = injectFunctions.updateBefore
    ? injectFunctions.updateBefore(declaration.model, beforeUpdate)
    : beforeUpdate

  const afterUpdate: UpdateAfterHook<T>[] = Array.isArray(
    declaration.update.afterUpdate
  )
    ? [...declaration.update.afterUpdate]
    : declaration.update.afterUpdate
    ? [declaration.update.afterUpdate as UpdateAfterHook<T>]
    : []

  declaration.update.afterUpdate = injectFunctions.updateAfter
    ? injectFunctions.updateAfter(declaration.model, afterUpdate)
    : afterUpdate

  return declaration
}

function injectCreateHooks<T extends Model<any, any>>(
  sourceDeclaration:
    | ModelDeclarationType<any, any>
    | GraphQLFieldConfig<any, any, any>,
  injectFunctions: InjectHooksOptions['injectFunctions']
) {
  const declaration = { ...sourceDeclaration }

  if ('actions' in declaration && !declaration.actions?.includes('create'))
    return declaration

  // If the create is resolved by a custom function, we don't need to inject hooks
  if (
    'create' in declaration &&
    declaration?.create &&
    'resolve' in declaration?.create
  ) {
    return declaration
  }

  if (
    'type' in declaration ||
    (declaration?.create && 'resolve' in declaration?.create)
  ) {
    return declaration
  }

  if (!declaration.create) {
    declaration.create = {} as CreateFieldDeclarationType<T>
  } else {
    declaration.create = { ...declaration.create }
  }

  declaration.create = declaration.create as CreateFieldDeclarationType<T>

  const beforeCreate: CreateBeforeHook<T>[] = Array.isArray(
    declaration.create.beforeCreate
  )
    ? [...declaration.create.beforeCreate]
    : declaration.create.beforeCreate
    ? [declaration.create.beforeCreate as CreateBeforeHook<T>]
    : []

  declaration.create.beforeCreate = injectFunctions.createBefore
    ? injectFunctions.createBefore(declaration.model, beforeCreate)
    : beforeCreate

  const afterCreate: CreateAfterHook<T>[] = Array.isArray(
    declaration.create.afterCreate
  )
    ? [...declaration.create.afterCreate]
    : declaration.create.afterCreate
    ? [declaration.create.afterCreate as CreateAfterHook<T>]
    : []

  declaration.create.afterCreate = injectFunctions.createAfter
    ? injectFunctions.createAfter(declaration.model, afterCreate)
    : afterCreate

  return declaration
}

function injectDeleteHooks<T extends Model<any, any>>(
  sourceDeclaration:
    | ModelDeclarationType<any, any>
    | GraphQLFieldConfig<any, any, any>,
  injectFunctions: InjectHooksOptions['injectFunctions']
) {
  const declaration = { ...sourceDeclaration }

  if ('actions' in declaration && !declaration.actions?.includes('delete'))
    return declaration

  // If the delete is resolved by a custom function, we don't need to inject hooks
  if (
    'delete' in declaration &&
    declaration?.delete &&
    'resolve' in declaration?.delete
  ) {
    return declaration
  }

  if (
    'type' in declaration ||
    (declaration?.delete && 'resolve' in declaration?.delete)
  ) {
    return declaration
  }

  if (!declaration.delete) {
    declaration.delete = {} as DeleteFieldDeclarationType<T>
  } else {
    declaration.delete = { ...declaration.delete }
  }

  declaration.delete = declaration.delete as DeleteFieldDeclarationType<T>

  const beforeDelete: DeleteBeforeHook<T>[] = Array.isArray(
    declaration.delete.beforeDelete
  )
    ? [...declaration.delete.beforeDelete]
    : declaration.delete.beforeDelete
    ? [declaration.delete.beforeDelete as DeleteBeforeHook<T>]
    : []

  declaration.delete.beforeDelete = injectFunctions.deleteBefore
    ? injectFunctions.deleteBefore(declaration.model, beforeDelete)
    : beforeDelete

  const beforeDeleteFetch: DeleteBeforeFetchHook<T>[] = Array.isArray(
    declaration.delete.beforeDeleteFetch
  )
    ? [...declaration.delete.beforeDeleteFetch]
    : declaration.delete.beforeDeleteFetch
    ? [declaration.delete.beforeDeleteFetch as DeleteBeforeFetchHook<T>]
    : []

  declaration.delete.beforeDeleteFetch = injectFunctions.deleteBeforeFetch
    ? injectFunctions.deleteBeforeFetch(declaration.model, beforeDeleteFetch)
    : beforeDeleteFetch

  const afterDelete: DeleteAfterHook<T>[] = Array.isArray(
    declaration.delete.afterDelete
  )
    ? [...declaration.delete.afterDelete]
    : declaration.delete.afterDelete
    ? [declaration.delete.afterDelete as DeleteAfterHook<T>]
    : []

  declaration.delete.afterDelete = injectFunctions.deleteAfter
    ? injectFunctions.deleteAfter(declaration.model, afterDelete)
    : afterDelete

  return declaration
}

// Injects a function that will be called with the model and the hooks
// The function can return a new list of hooks to be used instead of the original ones
export function injectHooks({
  graphqlSchemaDeclaration,
  injectFunctions,
}: InjectHooksOptions): GraphqlSchemaDeclarationType<any> {
  const graphqlSchemaDeclarationWithHooksInjected = {
    ...graphqlSchemaDeclaration,
  }

  for (const key in graphqlSchemaDeclarationWithHooksInjected) {
    let declaration = graphqlSchemaDeclarationWithHooksInjected[key]

    if ('model' in declaration) {
      declaration = injectListHooks(declaration, injectFunctions)
      declaration = injectUpdateHooks(declaration, injectFunctions)
      declaration = injectCreateHooks(declaration, injectFunctions)
      declaration = injectDeleteHooks(declaration, injectFunctions)
    }

    graphqlSchemaDeclarationWithHooksInjected[key] = declaration
  }

  return graphqlSchemaDeclarationWithHooksInjected
}
