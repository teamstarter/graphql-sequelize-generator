const { resolver } = require('graphql-sequelize')

const { EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize')

const {
  generateApolloServer,
  generateSchema,
  generateModelTypes,
  injectAssociations,
  generateCount
} = require('./generate')

const removeUnusedAttributes = require('./removeUnusedAttributes')

// Tell `graphql-sequelize` where to find the DataLoader context in the
// global request context
// @todo move this somewhere else, make it optional or remove from lib
resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY }

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
