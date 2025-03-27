import { resolver as sourceResolver } from 'graphql-sequelize'
import injectAssociations from './associations/inject'
import generateApolloServer from './generateApolloServer'
import generateModelTypes from './generateTypes/modelTypes'
import { injectHooks } from './injectHooks'
import generateCount from './queryResolvers/count'
import removeUnusedAttributes from './removeUnusedAttributes'
import generateSchema from './schema'
import { GraphqlSequelizeResolverType } from './types/types'

const resolver: GraphqlSequelizeResolverType = sourceResolver

export {
  // Functions to help generating a schema
  generateApolloServer,
  generateCount,
  generateModelTypes,
  generateSchema,
  injectAssociations,
  injectHooks,
  // Functions that you can use in your resolvers
  removeUnusedAttributes,
  //We export the resolver from graphql-sequelize because
  //graphql-sequelize does not provide types for it.
  resolver
}

