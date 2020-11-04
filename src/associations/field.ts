import {
  GraphQLList,
  GraphQLType,
  GraphQLScalarType,
  GraphQLString,
  GraphQLInt
} from 'graphql'
import { Association } from 'sequelize/types'
import { injectAssociations } from '..'
import { OutputTypes } from '../../types'

export default function generateAssociationField(
  relation: Association,
  types: OutputTypes,
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
    // @ts-ignore
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

  // @ts-ignore
  return field
}
