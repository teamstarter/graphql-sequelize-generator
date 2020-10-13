import {
  generateApolloServer,
  generateSchema,
  generateModelTypes,
  injectAssociations,
  generateCount
} from './generate'

import removeUnusedAttributes from './removeUnusedAttributes'

export {
  // Functions to help generating a schema
  generateApolloServer,
  generateSchema,
  generateModelTypes,
  generateCount,
  // Functions that you can use in your resolvers
  removeUnusedAttributes,
  injectAssociations
}
