const { simplifyAST } = require('graphql-sequelize')

/**
 * This functions returns the findOptions for a findAll/One with only the attributes required in the info.
 * By default all attributes are always fetched.
 *
 * @param {*} findOptions
 * @param {*} info
 * @param {Array<string>} keep An array of all the attributes to keep
 */
module.exports = function removeUnusedAttributes (findOptions, info, keep = []) {
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
