const { simplifyAST } = require('graphql-sequelize')

/**
 * This functions returns the findOptions for a findAll/One with only the attributes required in the info.
 * By default all attributes are always fetched.
 *
 * @param {*} findOptions
 * @param {*} info
 * @param {Array<string>} keep An array of all the attributes to keep
 */
module.exports = function removeUnusedAttributes (findOptions, info, currentModel, models, keep = []) {
  const { fieldNodes } = info
  if (!fieldNodes) {
    return findOptions
  }
  const ast = simplifyAST(fieldNodes[0], info)

  const linkFields = []
  const attributes = Object.keys(ast.fields).filter(
    attribute => {
      // The typename field is a key metadata and must always be returned if asked
      if (attribute === '__typename') {
        return false
      }
      // We check if the field is a leef or an entity
      if (
      Object.keys(ast.fields[attribute].fields).length > 0) {
        // If the field is an entity we check if we find the association
        if (models[currentModel.name].associations[attribute]) {
          const association = models[currentModel.name].associations[attribute]
          // If so we add the foreignKey to the list of fields to fetch.
          // Without it the sub-entities will not be fetched
          if (['HasOne', 'HasMany', 'BelongsToMany'].includes(association.associationType)) {
            linkFields.push(association.sourceKey)
          } else if (['BelongsTo'].includes(association.associationType)) {
            linkFields.push(association.foreignKey)
          } else {
            throw new Error(`removeUnusedAttributes does not support his association: ${association.associationType} for entity ${currentModel.name}/${association.as}`)
          }
        }
        // In any case, the entity name as attribute is not returned.
        return false
      }
      return true
    }
  )

  return { ...findOptions, attributes: [...new Set([...attributes, ...linkFields, ...keep])] }
}
