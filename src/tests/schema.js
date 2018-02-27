const models = require('./models')
const {
  generateModelTypes,
  generateGraphqlExpressMiddleware,
  generateSchema
} = require('./../index.js')
const { GraphQLObjectType, GraphQLString } = require('graphql')
const { PubSub } = require('graphql-subscriptions')

const graphqlSchemaDeclaration = {}
const modelTypes = generateModelTypes(models)
const pubSubInstance = new PubSub()

graphqlSchemaDeclaration.companyType = {
  model: models.companyType,
  actions: ['list']
}

graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ['list', 'create', 'delete', 'update'],
  list: {
    before: (findOptions, args, context, info) => {
      if (typeof findOptions.where === 'undefined') {
        findOptions.where = {}
      }
      findOptions.where = {
        $and: [findOptions.where, { departmentId: [1] }]
      }
      return findOptions
    }
  }
}

graphqlSchemaDeclaration.company = {
  model: models.company,
  actions: ['list', 'create'],
  list: {
    before: (findOptions, args, context, info) => {
      if (typeof findOptions.where === 'undefined') {
        findOptions.where = {}
      }
      findOptions.where = {
        $and: [findOptions.where, { id: [1] }]
      }
      return findOptions
    }
  }
}

graphqlSchemaDeclaration.department = {
  model: models.department,
  actions: ['list', 'create'],
  list: {
    resolver: (source, args, context, info) => {
      // Making custom resolvers on the list query can be useful
      // but keep in mind that it will impact the recursivity of the graph.
      // Here, defining our own resolver without taking into account the args
      // and the context will make that "departments" will never be returned
      // when queried outside a simple query like {department{id}}
      return models.department.findAll({
        where: {
          id: [1, 2, 3, 4, 5, 6, 7, 8]
        }
      })
    }
  }
}

graphqlSchemaDeclaration.serverStatistics = {
  type: new GraphQLObjectType({
    name: 'serverStatistics',
    description: 'Statistics about the server',
    fields: {
      serverBootDate: { type: GraphQLString }
    }
  }),
  // Example of args
  // args: {
  //   id: {
  //     name: 'id',
  //     type: new GraphQLNonNull(GraphQLID)
  //   }
  // },
  resolve: async (source, args, context, info) => {
    return {
      serverBootDate: context.bootDate
    }
  }
}

module.exports = {
  graphqlExpressMiddleware: generateGraphqlExpressMiddleware(
    graphqlSchemaDeclaration,
    modelTypes,
    pubSubInstance
  ),
  schema: generateSchema(graphqlSchemaDeclaration, modelTypes, pubSubInstance)
}
