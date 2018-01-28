const models = require('./models')
const {
  generateModelTypes,
  generateGraphqlExpressMiddleware
} = require('./../index.js')
const { GraphQLObjectType, GraphQLString } = require('graphql')

const graphqlSchemaDeclaration = {}
const modelTypes = generateModelTypes(models)

graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ['list', 'create'],
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
    before: (findOptions, args, context, info) => {
      findOptions.where = {
        id: [1, 2, 3, 4, 5, 6, 7, 8]
      }
      return findOptions
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
    modelTypes
  )
}
