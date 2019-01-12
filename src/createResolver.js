const { resolver } = require('graphql-sequelize')
const Sequelize = require('sequelize')

const allowOrderOnAssociations = (findOptions, args, context, info, model) => {
  if (typeof findOptions.order === 'undefined') {
    return findOptions
  }

  const checkForAssociationSort = singleOrder => {
    // When the comas is used, graphql-sequelize will not handle the 'reverse:' command.
    // We have to implement it ourselves.
    let field = null
    // By default we take the direction detected by GraphQL-sequelize
    // It will be 'ASC' if 'reverse:' was not specified.
    let direction = findOptions.order[0][1]
    // When reverse is not already removed by graphql-sequelize
    // we try to detect it ourselves. Happens for multiple fields sort.
    if (singleOrder.search('reverse:') === 0) {
      field = singleOrder.slice(8)
      direction = 'DESC'
    } else {
      field = singleOrder
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
        model.attributes[field] &&
        model.attributes[field].type.key === 'VIRTUAL'
      ) {
        // model.attributes[field].fieldName is used to avoid code-injection.
        field = Sequelize.literal(`\`${model.attributes[field].fieldName}\``)
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
  let processedOrder = []
  findOptions.order.map(order => {
    // Handle multiple sort fields.
    if (order[0].search(',') === -1) {
      checkForAssociationSort(order[0])
      return
    }
    const multipleOrder = order[0].split(',')
    for (const singleOrder of multipleOrder) {
      checkForAssociationSort(singleOrder)
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

const createResolver = (graphqlTypeDeclaration, models, relation = null) => {
  if (
    graphqlTypeDeclaration &&
    graphqlTypeDeclaration.list &&
    graphqlTypeDeclaration.list.resolver
  ) {
    return graphqlTypeDeclaration.list.resolver
  }

  const listBefore =
    graphqlTypeDeclaration.list && graphqlTypeDeclaration.list.before
      ? graphqlTypeDeclaration.list.before
      : undefined
  return resolver(relation || graphqlTypeDeclaration.model, {
    before: (findOptions, args, context, info) => {
      const processedFindOptions = argsAdvancedProcessing(
        findOptions,
        args,
        context,
        info,
        graphqlTypeDeclaration.model,
        models
      )

      if (listBefore) {
        return listBefore(processedFindOptions, args, context, info)
      }
      return processedFindOptions
    }
  })
}

module.exports = createResolver
