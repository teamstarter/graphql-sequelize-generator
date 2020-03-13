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
const types = generateModelTypes(models)
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
    },
    after: (result, args, context, info) => {
      for (const user of result) {
        if (user.name === 'Test 5 c 2') {
          user.name = `Mr ${user.name}`
        }
      }
    
      return result
    },
  },
  // The followings hooks are just here to demo their signatures.
  // They are not required and can be omited if you don't need them.
  create: {
    before: (source, args, context, info) => {
      // You can restrict the creation if needed
      return args.user
    },
    after: async (newEntity, source, args, context, info) => {
      // You can log what happened here
      return newEntity
    }
  },
  update: {
    before: (source, args, context, info) => {
      // You can restrict the creation if needed
      return args.user
    },
    after: async (
      updatedEntity,
      entitySnapshot,
      source,
      args,
      context,
      info
    ) => {
      // You can log what happened here
      return updatedEntity
    }
  },
  delete: {
    before: (where, source, args, context, info) => {
      // You can restrict the creation if needed
      return where
    },
    after: async (deletedEntity, source, args, context, info) => {
      // You can log what happened here
      return deletedEntity
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
  excludeFields: ['company', 'updatedAt'],
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
      types.outputTypes,
      models,
      () => null,
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

// Sometimes you want to add an action that do not match an existing model
// ex: Trigger a process
const customMutations = {}
customMutations.logThat = {
  type: new GraphQLObjectType({
    name: 'logThat',
    fields: {
      message: { type: GraphQLString }
    }
  }),
  args: {
    message: {
      type: GraphQLString
    }
  },
  description: 'Refresh the status of the call for projects.',
  resolve: async (source, args, context, info) => {
    // Your mutation can do something here...
    console.log(args.message)

    return {
      message: args.message
    }
  }
}

graphqlSchemaDeclaration.companySetting = {
  model: models.companySetting,
  excludeFromRoot: true,
  actions: ['list']
}

module.exports = globalPreCallback => ({
  server: generateApolloServer({
    graphqlSchemaDeclaration,
    customMutations,
    types,
    models,
    globalPreCallback,
    apolloServerOptions: {
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
  }),
  schema: generateSchema({
    graphqlSchemaDeclaration,
    types,
    models,
    globalPreCallback,
    customMutations,
    pubSubInstance
  })
})
