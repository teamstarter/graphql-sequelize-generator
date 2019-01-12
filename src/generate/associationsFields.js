const { GraphQLList, GraphQLString, GraphQLInt } = require('graphql')
const { attributeFields } = require('graphql-sequelize')

const createResolver = require('../createResolver')

const generateAssociationField = (relation, types, resolver = null) => {
  const type =
    relation.associationType === 'BelongsToMany' ||
    relation.associationType === 'HasMany'
      ? new GraphQLList(types[relation.target.name])
      : types[relation.target.name]

  let field = {
    type,
    isDeprecated: false,
    name: relation.as,
    args: [
      {
        // An arg with the key order will automatically be converted to a order on the target
        name: 'order',
        type: GraphQLString
      }
    ]
  }

  if (relation.associationType === 'HasMany') {
    // Limit and offset will only work for HasMany relation ship
    // Having the limit on the include will trigger a "Only HasMany associations support include.separate" error.
    // While sequelize N:M associations are not supported with hasMany. So BelongsToMany relationships
    // cannot be limited in a subquery. If you want to query them, make a custom resolver, or create a view.
    field.args.push({ name: 'limit', type: GraphQLInt })
    field.args.push({ name: 'offset', type: GraphQLInt })
  }

  if (resolver) {
    field.resolve = resolver
  }

  return field
}

/**
 * Returns the association fields of an entity.
 *
 * It iterates over all the associations and produces an object compatible with GraphQL-js.
 * BelongsToMany and HasMany associations are represented as a `GraphQLList` whereas a BelongTo
 * is simply an instance of a type.
 * @param {*} associations A collection of sequelize associations
 * @param {*} types Existing `GraphQLObjectType` types, created from all the Sequelize models
 */
const generateAssociationsFields = (associations, types) => {
  const fields = {}
  for (let associationName in associations) {
    fields[associationName] = generateAssociationField(
      associations[associationName],
      types
    )
  }
  return fields
}

const injectAssociations = (
  modelType,
  graphqlSchemaDeclaration,
  outputTypes,
  models,
  proxyModelName = null
) => {
  const modelName = proxyModelName || modelType.name
  const associations = models[modelName].associations
  if (Object.keys(associations).length === 0) {
    return modelType
  }
  const associationsFields = {}
  for (let associationName in associations) {
    if (!graphqlSchemaDeclaration[associations[associationName].target.name]) {
      throw new Error(
        `Cannot generate the association for model [${
          associations[associationName].target.name
        }] as it wasn't declared in the schema declaration.`
      )
    }
    associationsFields[associationName] = generateAssociationField(
      associations[associationName],
      outputTypes,
      createResolver(
        graphqlSchemaDeclaration[associations[associationName].target.name],
        models,
        associations[associationName]
      )
    )
  }

  for (const field in associationsFields) {
    modelType._fields[field] = associationsFields[field]
  }

  return modelType
}

module.exports = { injectAssociations, generateAssociationsFields }
