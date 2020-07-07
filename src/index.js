const {
  generateApolloServer,
  generateSchema,
  generateModelTypes,
  injectAssociations,
  generateCount
} = require('./generate')

const removeUnusedAttributes = require('./removeUnusedAttributes')

module.exports = {
  // Functions to help generating a schema
  generateApolloServer,
  generateSchema,
  generateModelTypes,
  generateCount,
  // Functions that you can use in your resolvers
  removeUnusedAttributes,
  injectAssociations
}
