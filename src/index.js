const { resolver, simplifyAST } = require('graphql-sequelize')
const Sequelize = require('sequelize')
const { argsToFindOptions } = require('graphql-sequelize')
const { PubSub } = require('graphql-subscriptions')
const { EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize')
const pubSubInstance = new PubSub()

// Tell `graphql-sequelize` where to find the DataLoader context in the
// global request context
resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY }

/**
 *
 * @param {*} findOptions
 * @param {*} info
 * @param {Array<string>} keep An array of all the attributes to keep
 */
const removeUnusedAttributes = (findOptions, info, keep = []) => {
  const { fieldNodes } = info
  if (!fieldNodes) {
    return findOptions
  }
  const ast = simplifyAST(fieldNodes[0], info)

  const attributes = Object.keys(ast.fields).filter(
    attribute =>
      attribute !== '__typename' &&
      Object.keys(ast.fields[attribute].fields).length === 0
  )

  return { ...findOptions, attributes: [...new Set([...attributes, ...keep])] }
}

const countResolver = (model, { before }) => {
  return async (source, args, context, info) => {
    if (typeof before !== 'undefined') {
      const countOptions = await before(
        argsToFindOptions.default(args, Object.keys(model.rawAttributes)),
        args,
        context,
        info
      )
      return model.count(countOptions)
    }
    return model.count(
      argsToFindOptions.default(args, Object.keys(model.rawAttributes))
    )
  }
}

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
  listBefore,
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

  if (listBefore) {
    return listBefore(findOptions, args, context, info)
  }
  return findOptions
}

module.exports = {
  // @todo Remove following?
  countResolver,
  pubSub: pubSubInstance,
  removeUnusedAttributes,
  argsAdvancedProcessing
}
