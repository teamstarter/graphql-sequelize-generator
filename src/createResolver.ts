import { resolver } from 'graphql-sequelize'
import { GlobalBeforeHook, ModelDeclarationType } from '../types'
import removeUnusedAttributes from './removeUnusedAttributes'

function allowOrderOnAssociations(findOptions: any, model: any) {
  if (typeof findOptions.order === 'undefined') {
    return findOptions
  }
  const processedOrder: any = []

  const checkForAssociationSort = (singleOrder: any, index: any) => {
    // When the comas is used, graphql-sequelize will not handle the 'reverse:' command.
    // We have to implement it ourselves.
    let field = null
    // By default we take the direction detected by GraphQL-sequelize
    // It will be 'ASC' if 'reverse:' was not specified.
    // But this will only work for the first field.
    let direction = index === 0 ? findOptions.order[0][1] : 'ASC'
    // When reverse is not already removed by graphql-sequelize
    // we try to detect it ourselves. Happens for multiple fields sort.
    if (singleOrder.search('reverse:') === 0) {
      field = singleOrder.slice(8).trim()
      direction = 'DESC'
    } else {
      field = singleOrder.trim()
    }

    // if there is exactly one dot, we check for associations
    const parts = field.split('.')
    if (parts.length === 2) {
      const associationName = parts[0]
      if (typeof model.associations[associationName] === 'undefined') {
        throw new Error(
          `Association ${associationName} unknown on model ${model.name} order`
        )
      }
      if (typeof findOptions.include === 'undefined') {
        findOptions.include = []
      }

      const modelInclude: any = {
        model: model.associations[associationName].target,
      }

      if (model.associations[associationName].as) {
        modelInclude.as = model.associations[associationName].as
      }

      findOptions.include.push(modelInclude)

      const modelSort: any = {
        model: model.associations[associationName].target,
      }
      // When sorting by a associated table, the alias must be specified
      // if defined in the association definition.
      if (model.associations[associationName].as) {
        modelSort.as = model.associations[associationName].as
      }

      processedOrder.push([modelSort, parts[1], direction])
    } else {
      // Virtual field must be sorted using quotes
      // as they are not real fields.
      if (
        model.rawAttributes[field] &&
        model.rawAttributes[field].type.key === 'VIRTUAL'
      ) {
        // When a virtual field is used, we must sort with the expression and not
        // the name of the field, as it is not compatible with multiple database engines.
        // IE : Sorting by virtual field is inefficient if using sub-queries.
        field = model.rawAttributes[field].type.fields[0][0]
      }
      processedOrder.push([field, direction])
    }
  }

  /**
   * The sorting in sequelize can be represented in multiple forms:
   * order = ['id', 'DESC']
   * order = [['id', 'DESC'], ['fullname', 'ASC']]
   * order = [[models.user, 'id', 'DESC']]
   *
   * This part tries to add a multiple-sort feature to what is already
   * parsed by graphql-sequelize.
   *
   * order = ['id,reverse:fullname', 'ASC']
   * to
   * order = [['id', 'ASC'], ['fullname', 'DESC']
   */
  findOptions.order.map((order: any) => {
    // Handle multiple sort fields.
    if (order[0].search(',') === -1) {
      checkForAssociationSort(order[0], 0)
      return
    }
    const multipleOrder = order[0].split(',')
    for (const index in multipleOrder) {
      checkForAssociationSort(multipleOrder[index], parseInt(index))
    }
  })
  findOptions.order = processedOrder
  return findOptions
}

const argsAdvancedProcessing = (
  findOptions: any,
  args: any,
  context: any,
  info: any,
  model: any,
  models: any
) => {
  findOptions = allowOrderOnAssociations(findOptions, model)

  // When an association uses a scope, we have to add it to the where condition by default.
  if (
    info.parentType &&
    models[info.parentType.name] &&
    models[info.parentType.name].associations[info.fieldName].scope
  ) {
    findOptions.where = {
      ...(findOptions.where ? findOptions.where : {}),
      ...models[info.parentType.name].associations[info.fieldName].scope,
    }
  }

  return findOptions
}

export default function createResolver(
  graphqlTypeDeclaration: ModelDeclarationType,
  models: any,
  globalPreCallback: any,
  relation = null
) {
  if (graphqlTypeDeclaration?.list?.resolver) {
    return async (source: any, args: any, context: any, info: any) => {
      const customResolverHandle = globalPreCallback('customListBefore')
      if (graphqlTypeDeclaration?.list?.resolver) {
        const customResult = await graphqlTypeDeclaration.list.resolver(
          source,
          args,
          context,
          info
        )
        if (customResolverHandle) {
          customResolverHandle()
        }
        return customResult
      }
    }
  }

  const listBefore =
    graphqlTypeDeclaration.list && graphqlTypeDeclaration.list.before
      ? graphqlTypeDeclaration.list.before
      : undefined
  const listAfter =
    graphqlTypeDeclaration.list && graphqlTypeDeclaration.list.after
      ? graphqlTypeDeclaration.list.after
      : undefined

  return resolver(relation || graphqlTypeDeclaration.model, {
    contextToOptions: graphqlTypeDeclaration.list
      ? graphqlTypeDeclaration.list.contextToOptions
      : undefined,
    before: async (findOptions: any, args: any, context: any, info: any) => {
      const processedFindOptions = argsAdvancedProcessing(
        findOptions,
        args,
        context,
        info,
        graphqlTypeDeclaration.model,
        models
      )

      if (
        graphqlTypeDeclaration.list &&
        graphqlTypeDeclaration.list.enforceMaxLimit
      ) {
        if (
          // If the limit is not set, nullish or bigger than the max limit
          // we enforce it.
          (!findOptions.limit ||
            findOptions.limit > graphqlTypeDeclaration.list.enforceMaxLimit) &&
          // Except if the limit is not on the root query
          // This is because the limit of sub-Object linked with BelongsToMany is currently not possible
          // See associationsFields.js L46
          info.parentType &&
          info.parentType.name === 'Root_Query'
        ) {
          findOptions.limit = graphqlTypeDeclaration.list.enforceMaxLimit
        }
      }
      if (graphqlTypeDeclaration.before) {
        const beforeList: GlobalBeforeHook[] =
          typeof graphqlTypeDeclaration.before.length !== 'undefined'
            ? (graphqlTypeDeclaration.before as GlobalBeforeHook[])
            : ([
                graphqlTypeDeclaration.before as GlobalBeforeHook,
              ] as GlobalBeforeHook[])

        for (const before of beforeList) {
          const handle = globalPreCallback('listGlobalBefore')
          await before(args, context, info)
          if (handle) {
            handle()
          }
        }
      }

      if (listBefore) {
        const handle = globalPreCallback('listBefore')
        const result = await listBefore(
          processedFindOptions,
          args,
          context,
          info
        )
        if (handle) {
          handle()
        }
        return graphqlTypeDeclaration.list &&
          graphqlTypeDeclaration.list.removeUnusedAttributes === false
          ? result
          : removeUnusedAttributes(
              result,
              info,
              graphqlTypeDeclaration.model,
              models
            )
      }

      return graphqlTypeDeclaration.list &&
        graphqlTypeDeclaration.list.removeUnusedAttributes === false
        ? processedFindOptions
        : removeUnusedAttributes(
            processedFindOptions,
            info,
            graphqlTypeDeclaration.model,
            models
          )
    },
    after: async (result: any, args: any, context: any, info: any) => {
      if (listAfter) {
        const handle = globalPreCallback('listAfter')
        const modifiedResult = await listAfter(result, args, context, info)
        if (handle) {
          handle()
        }
        return modifiedResult
      }
      return result
    },
  })
}
