// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateMu... Remove this comment to see the full error message
const generateMutationCreate = require('./mutationCreateResolver')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateMu... Remove this comment to see the full error message
const generateMutationUpdate = require('./mutationUpdateResolver')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateMu... Remove this comment to see the full error message
const generateMutationDelete = require('./mutationDeleteResolver')
const generateCount = require('./countResolver')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateMo... Remove this comment to see the full error message
const generateModelTypes = require('./modelTypes')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateGr... Remove this comment to see the full error message
const generateGraphQLType = require('./graphQLType')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateSc... Remove this comment to see the full error message
const generateSchema = require('./schema')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateAp... Remove this comment to see the full error message
const generateApolloServer = require('./generateApolloServer')
const {
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'injectAsso... Remove this comment to see the full error message
  injectAssociations,
  // @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateAs... Remove this comment to see the full error message
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
