const generateMutationCreate = require('./mutationCreateResolver')
const generateMutationUpdate = require('./mutationUpdateResolver')
const generateMutationDelete = require('./mutationDeleteResolver')
const generateModelTypes = require('./modelTypes')
const generateGraphQLType = require('./graphQLType')
const generateSchema = require('./schema')
const generateGraphqlExpressMiddleware = require('./graphqlExpressMiddleware')
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
  generateSchema,
  generateGraphqlExpressMiddleware,
  injectAssociations
}
