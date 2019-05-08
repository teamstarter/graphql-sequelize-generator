const { GraphQLObjectType, GraphQLString, GraphQLList } = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const { resolver, defaultListArgs } = require('graphql-sequelize')
const { Op } = require('sequelize')
const {
  generateApolloServer,
  generateSchema,
  generateModelTypes,
  injectAssociations
} = require('./../generate')
const models = require('./models')

const graphqlSchemaDeclaration = {}
const modelTypes = generateModelTypes(models)
const pubSubInstance = new PubSub()

graphqlSchemaDeclaration.companyType = {
  model: models.companyType,
  actions: ['list', 'create']
}

graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ['list', 'create', 'delete', 'update', 'count'],
  list: {
    before: (findOptions, args, context, info) => {
      if (typeof findOptions.where === 'undefined') {
        findOptions.where = {}
      }
      findOptions.where = {
        [Op.and]: [findOptions.where, { departmentId: [1] }]
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

      // This is an example of rights enforcement
      findOptions.where = {
        [Op.and]: [findOptions.where, { id: [1, 3, 5, 7] }]
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
      // but keep in mind that it will be used at any level in the graph.

      // Here, defining our own resolver without taking into account the args
      // and the source would make that "departments" would never be returned
      // when queried outside a simple query like {department{id}}

      // Be sure to look at the source!
      if (source && source.departmentId) {
        return models.department.findOne({ where: { id: source.departmentId } })
      }

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
  resolve: async (source, args, context, info) => {
    return {
      serverBootDate: context.bootDate
    }
  }
}

const OddUser = new GraphQLObjectType({
  name: 'OddUser',
  description: 'Like an user, but only with odd ids.',
  fields: {
    handleAdditionalFields: { type: GraphQLString }
  }
})

graphqlSchemaDeclaration.oddUser = {
  type: new GraphQLList(
    injectAssociations(
      OddUser,
      graphqlSchemaDeclaration,
      modelTypes.outputTypes,
      models,
      'user'
    )
  ),
  args: {
    ...defaultListArgs()
  },
  resolve: resolver(models.user, {
    before: async (findOptions, args, context, info) => {
      findOptions.where = {
        [Op.and]: [
          findOptions.where,
          { id: models.sequelize.literal('id % 2') }
        ]
      }
      return findOptions
    }
  })
}

module.exports = {
  server: generateApolloServer(
    graphqlSchemaDeclaration,
    modelTypes,
    models,
    {
      playground: true,
      // Example of context modification.
      context: ({ req, connection }) => {
        // Connection is provided when a webSocket is connected.
        if (connection) {
          // check connection for metadata
          return connection.context
        }

        // This is an example of context manipulation.
        return { ...req, bootDate: '2017-01-01' }
      },
      // Example of socket security hook.
      subscriptions: {
        onConnect: (connectionParams, webSocket) => {
          return true
        }
      }
    },
    pubSubInstance
  ),
  schema: generateSchema(
    graphqlSchemaDeclaration,
    modelTypes,
    models,
    pubSubInstance
  )
}
