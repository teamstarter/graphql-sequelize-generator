import { resolver } from 'graphql-sequelize'
import { FindOptions, Model, ModelStatic, Op } from 'sequelize'
import removeUnusedAttributes from './../removeUnusedAttributes'
import {
  FindOptionsWithAttributesWhere,
  GlobalBeforeHook,
  ModelDeclarationType,
  QueryAfterHook,
  QueryBeforeHook,
  SequelizeModels,
} from './../types/types'

interface ModelInclude {
  model: ModelStatic<Model<any>>
  as?: string
}

interface ModelSort {
  model: ModelStatic<Model<any>>
  as?: string
}

function allowOrderOnAssociations<M extends Model<any>>(
  findOptions: FindOptions<M>,
  model: ModelStatic<M>
): FindOptionsWithAttributesWhere<M> {
  if (typeof findOptions.order === 'undefined') {
    return findOptions as FindOptionsWithAttributesWhere<M>
  }
  const processedOrder: any[] = []

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

      const modelInclude: ModelInclude = {
        model: model.associations[associationName].target,
      }

      if (model.associations[associationName].as) {
        modelInclude.as = model.associations[associationName].as
      }

      // Type assertion to specify the type of findOptions.include as an array
      if ('push' in findOptions.include) {
        findOptions.include.push(modelInclude)
      }

      const modelSort: ModelSort = {
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
        (model.rawAttributes[field].type as any).key === 'VIRTUAL'
      ) {
        // When a virtual field is used, we must sort with the expression and not
        // the name of the field, as it is not compatible with multiple database engines.
        // IE : Sorting by virtual field is inefficient if using sub-queries.
        field = (model.rawAttributes[field].type as any).fields[0][0]
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
  return findOptions as FindOptionsWithAttributesWhere<M>
}

const argsAdvancedProcessing = <M extends Model<any>>(
  findOptions: FindOptions<M>,
  args: any,
  context: any,
  info: any,
  model: ModelStatic<M>,
  models: SequelizeModels
) => {
  const findOptionsWithFlatWhere: FindOptionsWithAttributesWhere<M> =
    allowOrderOnAssociations(findOptions, model)

  // When an association uses a scope, we have to add it to the where condition by default.
  if (
    info.parentType &&
    models[info.parentType.name] &&
    (models[info.parentType.name].associations[info.fieldName] as any).scope
  ) {
    findOptionsWithFlatWhere.where = {
      ...(findOptions.where ? findOptions.where : {}),
      ...(models[info.parentType.name].associations[info.fieldName] as any)
        .scope,
    }
  }

  return findOptionsWithFlatWhere
}

async function trimAndOptimizeFindOptions<M extends Model<any>>({
  findOptions,
  graphqlTypeDeclaration,
  info,
  models,
  args,
}: {
  findOptions: FindOptions<M>
  graphqlTypeDeclaration: ModelDeclarationType<M>
  info: any
  models: SequelizeModels
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

    // There might be many primary keys.
    if (
      graphqlTypeDeclaration.model.primaryKeyAttributes &&
      graphqlTypeDeclaration.model.primaryKeyAttributes.length > 0
    ) {
      const fetchIdsMultiColumnsFindOptions = {
        ...trimedFindOptions,
        // We only fetch the primary attribute
        attributes: graphqlTypeDeclaration.model.primaryKeyAttributes,
      } as FindOptions<M>
      const result = await graphqlTypeDeclaration.model.findAll(
        fetchIdsMultiColumnsFindOptions
      )

      return {
        ...trimedFindOptions,
        offset: undefined,
        limit: undefined,
        // We override the where to only fetch the rows we want.
        where: {
          [Op.or]: result.map((r: any) => {
            const where: any = {}
            graphqlTypeDeclaration.model.primaryKeyAttributes.forEach(
              (attr: string) => {
                if (!r[attr]) {
                  throw new Error(
                    `Got a null value for Primary key ${attr}, for model ${graphqlTypeDeclaration.model.name}. This should never be the case. Disable the optimization for this model with disableOptimizationForLimitOffset or make sure the primary keys of the table have no null values.`
                  )
                }
                where[attr] = r[attr]
              }
            )
            return where
          }),
        },
      }
    }

    // Or a single key
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

export default function createListResolver<
  M extends Model<any>,
  TContext = any
>(
  graphqlTypeDeclaration: ModelDeclarationType<M, TContext>,
  models: SequelizeModels,
  globalPreCallback: any,
  relation: ModelStatic<M> | null = null
) {
  if (graphqlTypeDeclaration?.list?.resolver) {
    return async (source: any, args: any, context: TContext, info: any) => {
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
    before: async (
      findOptions: FindOptions<M>,
      args: any,
      context: TContext,
      info: any
    ) => {
      if (!findOptions.where) {
        findOptions.where = {}
      }

      if (typeof findOptions.include === 'undefined') {
        findOptions.include = []
      }

      let processedFindOptions: FindOptionsWithAttributesWhere<M> =
        argsAdvancedProcessing(
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
          (!findOptions.limit ||
            findOptions.limit > graphqlTypeDeclaration.list.enforceMaxLimit) &&
          info.parentType &&
          info.parentType.name === 'Root_Query'
        ) {
          findOptions.limit = graphqlTypeDeclaration.list.enforceMaxLimit
        }
      }

      // Global hooks, cannot impact the findOptions
      if (graphqlTypeDeclaration.before) {
        const beforeList: GlobalBeforeHook<TContext>[] = Array.isArray(
          graphqlTypeDeclaration.before
        )
          ? graphqlTypeDeclaration.before
          : [graphqlTypeDeclaration.before as GlobalBeforeHook<TContext>]

        for (const before of beforeList) {
          const handle = globalPreCallback('listGlobalBefore')
          await before({ args, context, info })
          if (handle) {
            handle()
          }
        }
      }

      // before hook, can mutate the findOptions
      if (listBefore) {
        const beforeList: QueryBeforeHook<M>[] = Array.isArray(listBefore)
          ? listBefore
          : [listBefore as QueryBeforeHook<M>]

        for (const before of beforeList) {
          const handle = globalPreCallback('listBefore')
          const resultBefore: FindOptionsWithAttributesWhere<M> = await before({
            findOptions: processedFindOptions,
            args,
            context,
            info,
          })
          if (!resultBefore) {
            throw new Error(
              'The before hook of the list endpoint must return a value.'
            )
          }
          processedFindOptions = resultBefore
          if (handle) {
            handle()
          }
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
    after: async (result: M | M[], args: any, context: TContext, info: any) => {
      if (listAfter) {
        const afterList: QueryAfterHook<M>[] = Array.isArray(listAfter)
          ? listAfter
          : [listAfter as QueryAfterHook<M>]

        let modifiedResult = result
        for (const after of afterList) {
          const handle = globalPreCallback('listAfter')
          modifiedResult = await after({
            result: modifiedResult,
            args,
            context,
            info,
          })
          if (handle) {
            handle()
          }
        }
        return modifiedResult
      }
      return result
    },
  })
}
