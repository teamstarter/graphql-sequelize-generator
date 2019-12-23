const { resolver } = require('graphql-sequelize')

const allowOrderOnAssociations = (findOptions, args, context, info, model) => {
  if (typeof findOptions.order === 'undefined') {
    return findOptions
  }
  const processedOrder = []

  const checkForAssociationSort = singleOrder => {
    // When the comas is used, graphql-sequelize will not handle the 'reverse:' command.
    // We have to implement it ourselves.
    let field = null
    // By default the direction is ASC.
    let direction = 'ASC'
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
      findOptions.include.push({
        model: model.associations[associationName].target
      })
      processedOrder.push([
        model.associations[associationName].target,
        parts[1],
        direction
      ])
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
  findOptions.order.map(order => {
    // Handle multiple sort fields.
    if (order[0].search(',') === -1) {
      checkForAssociationSort(order[0])
      return
    }
    const multipleOrder = order[0].split(',')
    for (const splitOrder of multipleOrder) {
      checkForAssociationSort(splitOrder)
    }
  })
  findOptions.order = processedOrder
  return findOptions
}

const argsAdvancedProcessing = (
  findOptions,
  args,
  context,
  info,
  model,
  models
) => {
  findOptions = allowOrderOnAssociations(
    findOptions,
    args,
    context,
    info,
    model
  )

  // When an association uses a scope, we have to add it to the where condition by default.
  if (
    info.parentType &&
    models[info.parentType.name] &&
    models[info.parentType.name].associations[info.fieldName].scope
  ) {
    findOptions.where = {
      ...(findOptions.where ? findOptions.where : {}),
      ...models[info.parentType.name].associations[info.fieldName].scope
    }
  }

  return findOptions
}

const createResolver = (
  graphqlTypeDeclaration,
  models,
  globalPreCallback,
  relation = null
) => {
  if (
    graphqlTypeDeclaration &&
    graphqlTypeDeclaration.list &&
    graphqlTypeDeclaration.list.resolver
  ) {
    return async (source, args, context, info) => {
      const customResolverHandle = globalPreCallback('customListBefore')
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

  const listBefore =
    graphqlTypeDeclaration.list && graphqlTypeDeclaration.list.before
      ? graphqlTypeDeclaration.list.before
      : undefined
  return resolver(relation || graphqlTypeDeclaration.model, {
    before: async (findOptions, args, context, info) => {
      const processedFindOptions = argsAdvancedProcessing(
        findOptions,
        args,
        context,
        info,
        graphqlTypeDeclaration.model,
        models
      )

      if (listBefore) {
        let handle = null
        handle = globalPreCallback('listBefore')
        const result = await listBefore(
          processedFindOptions,
          args,
          context,
          info
        )
        if (handle) {
          handle()
        }
        return result
      }
      return processedFindOptions
    }
  })
}

module.exports = createResolver
