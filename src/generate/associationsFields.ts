import {
  GraphQLList,
  GraphQLString,
  GraphQLInt,
  GraphQLType,
  GraphQLScalarType
} from 'graphql'
import { attributeFields } from 'graphql-sequelize'
import createResolver from '../createResolver'
import _debug from 'debug'

const debug = _debug('gsg')

function generateAssociationField(
  relation: any,
  types: any,
  graphqlSchemaDeclaration?: any,
  models?: any,
  globalPreCallback?: any,
  resolver = null
): {
  type: GraphQLList<GraphQLType>
  isDeprecated: boolean
  associationsInjected: boolean
  name: string
  args: {
    name: string
    type: GraphQLScalarType
  }[]
  resolve?: any
} {
  const newBaseType =
    graphqlSchemaDeclaration &&
    !types[relation.target.name].associationsInjected
      ? injectAssociations(
          types[relation.target.name],
          graphqlSchemaDeclaration,
          types,
          models,
          globalPreCallback
        )
      : types[relation.target.name]

  const type =
    relation.associationType === 'BelongsToMany' ||
    relation.associationType === 'HasMany'
      ? new GraphQLList(newBaseType)
      : newBaseType

  const field = {
    type,
    isDeprecated: false,
    associationsInjected: true,
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
    // @ts-ignore
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
export function generateAssociationsFields(associations: string[], types: any) {
  const fields: { [key: string]: any } = {}
  for (const associationName in associations) {
    fields[associationName] = generateAssociationField(
      associations[associationName],
      types
    )
  }
  return fields
}

export function injectAssociations(
  modelGraphQLType: any,
  graphqlSchemaDeclaration: any,
  outputTypes: any,
  models: any,
  globalPreCallback: any,
  proxyModelName = null
): GraphQLType {
  const modelName = proxyModelName || modelGraphQLType.name
  if (Object.keys(modelName).length === 0) {
    throw new Error(
      'Associations cannot be injected if no models were provided.'
    )
  }

  outputTypes[modelName].associationsInjected = true

  const associations = models[modelName].associations
  if (Object.keys(associations).length === 0) {
    return modelGraphQLType
  }

  const associationsFields: any = {}
  for (const associationName in associations) {
    if (!graphqlSchemaDeclaration[associations[associationName].target.name]) {
      debug(
        `Cannot generate the association for model [${associations[associationName].target.name}] as it wasn't declared in the schema declaration. Skipping it.`
      )
      continue
    }
    associationsFields[associationName] = generateAssociationField(
      associations[associationName],
      outputTypes,
      graphqlSchemaDeclaration,
      models,
      globalPreCallback,
      createResolver(
        graphqlSchemaDeclaration[associations[associationName].target.name],
        models,
        globalPreCallback,
        associations[associationName]
      )
    )
  }

  // We have to mutate the original field, as type names must be unique
  // We cannot return a new type as the type may have already been used
  // In previous models.
  let baseFields: any = {}
  if (typeof graphqlSchemaDeclaration[modelName] !== 'undefined') {
    baseFields = attributeFields(graphqlSchemaDeclaration[modelName].model, {
      allowNull: false,
      exclude: graphqlSchemaDeclaration[modelName].excludeFields
    })
  }

  // Fields can either be a function or an Object.
  // Due to the behavior of modelGraphQLType.toConfig(),
  // we must reconvert the fields to an Object to add more fields.

  // For more details, look at this file
  // node_modules/graphql/type/definition.js

  // As this will be calling the fields definition function,
  // make sure to not call injectAssociations in the middle of the fields definitions generation.
  // The model Types must already be generated.
  const defaultFields = modelGraphQLType.getFields()
  // The default fields needs to be filtered as attributeFields will
  // not contain the fields that are not defined in the models files.
  const fields = Object.keys(defaultFields).reduce(
    (acc: any, field: string) => {
      if (
        !graphqlSchemaDeclaration[modelName].excludeFields ||
        !graphqlSchemaDeclaration[modelName].excludeFields.includes(field)
      ) {
        acc[field] = defaultFields[field]
      }
      return acc
    },
    {}
  )

  for (const field in baseFields) {
    if (
      !graphqlSchemaDeclaration[modelName].excludeFields ||
      !graphqlSchemaDeclaration[modelName].excludeFields.includes(field)
    ) {
      fields[field] = {
        name: field,
        isDeprecated: false,
        args: [],
        ...baseFields[field]
      }
    }
  }

  for (const field in associationsFields) {
    // One can also exclude generated field
    if (
      !graphqlSchemaDeclaration[modelName].excludeFields ||
      !graphqlSchemaDeclaration[modelName].excludeFields.includes(field)
    ) {
      fields[field] = associationsFields[field]
    }
  }

  modelGraphQLType._fields = fields

  return modelGraphQLType
}
