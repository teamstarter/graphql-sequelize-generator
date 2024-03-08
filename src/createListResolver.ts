import { resolver } from 'graphql-sequelize'
import { FindOptions, Model } from 'sequelize'
import removeUnusedAttributes from './removeUnusedAttributes'
import { GlobalBeforeHook, ModelDeclarationType } from './types/types'

function allowOrderOnAssociations(findOptions: FindOptions<any>, model: any) {
  if (typeof findOptions.order === 'undefined') {
    return findOptions
  }
  const processedOrder: any = []

  const checkForAssociationSort = (singleOrder: any, index: any) => {
    // When the comas is used, graphql-sequelize will not handle the 'reverse:' command.
    // We have to implement it ourselves.
    let field: string | null = null
    // By default we take the direction detected by GraphQL-sequelize
    // It will be 'ASC' if 'reverse:' was not specified.
    // But this will only work for the first field.
    let direction =
      index === 0 && findOptions.order ? findOptions.order[0][1] : 'ASC'
    // When reverse is not already removed by graphql-sequelize
    // we try to detect it ourselves. Happens for multiple fields sort.
    if (singleOrder.search('reverse:') === 0) {
      field = singleOrder.slice(8).trim()
      direction = 'DESC'
    } else {
      field = singleOrder.trim()
    }

    // if there is exactly one dot, we check for associations
    const parts = field ? field.split('.') : []
    if (parts.length === 2) {
      const associationName = parts[0]
      if (typeof model.associations[associationName] === 'undefined') {
        throw new Error(
          `Association ${associationName} unknown on model ${model.name} order`
        )
      }
      if (
        typeof findOptions.include === 'undefined' ||
        typeof findOptions.include === 'string'
      ) {
        findOptions.include = []
      }

      const modelInclude: any = {
        model: model.associations[associationName].target,
      }

      if (model.associations[associationName].as) {
        modelInclude.as = model.associations[associationName].as
      }

      // Type assertion to specify the type of findOptions.include as an array
      if ('push' in findOptions.include) {
        findOptions.include.push(modelInclude)
      }

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
        field &&
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
  if ('map' in findOptions.order) {
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
  }
  findOptions.order = processedOrder
  return findOptions
}

const argsAdvancedProcessing = (
  findOptions: FindOptions<any>,
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

async function trimAndOptimizeFindOptions({
  findOptions,
  graphqlTypeDeclaration,
  info,
  models,
  args,
}: {
  findOptions: FindOptions<any>
  graphqlTypeDeclaration: any
  info: any
  models: any
  args: any
}) {
  const trimedFindOptions =
    graphqlTypeDeclaration.list &&
    graphqlTypeDeclaration.list.removeUnusedAttributes === false
      ? findOptions
      : removeUnusedAttributes(
          findOptions,
          info,
          graphqlTypeDeclaration.model,
          models
        )

  // As sequelize-dataloader does not support the include option, we have to remove it.
  // It does not differenciate between an empty include and an include with models so we have to remove it.
  if (
    trimedFindOptions.include &&
    typeof trimedFindOptions.include === 'object' &&
    'length' in trimedFindOptions.include &&
    trimedFindOptions.include.length === 0
  ) {
    delete trimedFindOptions.include
  }

  // As sequelize-dataloader does not support the where option, we have to remove it.
  // It does not differenciate between an empty where and a where with properties so we have to remove it.
  if (
    trimedFindOptions.where &&
    // We can only optimize the where if it was not passed as an argument.
    // This is due to an implementation detail of /node_modules/graphql-sequelize/lib/resolver.js:28:39
    !args.where &&
    // Symbols like [Op.and] are not returned by Object.keys and must be handled separately.
    Object.getOwnPropertySymbols(trimedFindOptions.where).length === 0 &&
    Object.keys(trimedFindOptions.where).length === 0
  ) {
    delete trimedFindOptions.where
  }

  if (
    // If we have a list with a limit and an offset
    trimedFindOptions.limit &&
    trimedFindOptions.offset &&
    // And no explicit instructions to not optimize it.
    // In the majority of the case, doubling the number of queries should be either
    // faster OR not significantly slower.
    // As GSG is made to be "easy-to-use", we optimize by default.
    // We expect limit to be small enough to not cause performance issues.
    // If you are in a case where you need to fetch a big offset, you should disable the optimization.
    (!graphqlTypeDeclaration.list ||
      typeof graphqlTypeDeclaration.list.disableOptimizationForLimitOffset ===
        'undefined' ||
      graphqlTypeDeclaration.list.disableOptimizationForLimitOffset !== true)
  ) {
    // then we pre-fetch the ids to avoid slowness problems for big offsets.
    const fetchIdsFindOptions = {
      ...trimedFindOptions,
      // We only fetch the primary attribute
      attributes: [graphqlTypeDeclaration.model.primaryKeyAttribute],
    }
    const result = await graphqlTypeDeclaration.model.findAll(
      fetchIdsFindOptions
    )

    return {
      ...trimedFindOptions,
      offset: undefined,
      limit: undefined,
      // We override the where to only fetch the rows we want.
      where: {
        [graphqlTypeDeclaration.model.primaryKeyAttribute]: result.map(
          (r: any) => r[graphqlTypeDeclaration.model.primaryKeyAttribute]
        ),
      },
    }
  }

  return trimedFindOptions
}

export default function createListResolver(
  graphqlTypeDeclaration: ModelDeclarationType<any>,
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
      let processedFindOptions: FindOptions<any> = argsAdvancedProcessing(
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

      // Global hooks, cannot impact the findOptions
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

      // before hook, can mutate the findOptions
      if (listBefore) {
        const handle = globalPreCallback('listBefore')
        const resultBefore = await listBefore(
          processedFindOptions,
          args,
          context,
          info
        )
        if (!resultBefore) {
          throw new Error(
            'The before hook of the list endpoint must return a value.'
          )
        }

        // The list overwrite the findOptions
        processedFindOptions = resultBefore

        if (handle) {
          handle()
        }
      }

      return trimAndOptimizeFindOptions({
        findOptions: processedFindOptions,
        graphqlTypeDeclaration,
        info,
        models,
        args,
      })
    },
    after: async (
      result: Model<any> | Model<any>[],
      args: any,
      context: any,
      info: any
    ) => {
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
