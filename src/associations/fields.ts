import { Associations } from '../../types'
import generateAssociationField from './field'

/**
 * Returns the association fields of an entity.
 *
 * It iterates over all the associations and produces an object compatible with GraphQL-js.
 * BelongsToMany and HasMany associations are represented as a `GraphQLList` whereas a BelongTo
 * is simply an instance of a type.
 * @param {*} associations A collection of sequelize associations
 * @param {*} types Existing `GraphQLObjectType` types, created from all the Sequelize models
 */
export default function generateAssociationsFields(
  associations: Associations,
  types: any
) {
  const fields: { [key: string]: any } = {}
  for (const associationName in associations) {
    fields[associationName] = generateAssociationField(
      associations[associationName],
      types
    )
  }
  return fields
}
