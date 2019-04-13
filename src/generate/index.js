const generateMutationCreate = require('./mutationCreateResolver')
const generateMutationUpdate = require('./mutationUpdateResolver')
const generateMutationDelete = require('./mutationDeleteResolver')
const generateCount = require('./countResolver')
const generateModelTypes = require('./modelTypes')
const generateGraphQLType = require('./graphQLType')
const generateSchema = require('./schema')
const generateApolloServer = require('./generateApolloServer')
const {
  injectAssociations,
  generateAssociationsFields
} = require('./associationsFields')

module.exports = {
  generateModelTypes,
  generateGraphQLType,
  generateAssociationsFields,
  generateMutationCreate,
  generateMutationUpdate,
  generateMutationDelete,
  generateCount,
  generateSchema,
  generateApolloServer,
  injectAssociations
}
