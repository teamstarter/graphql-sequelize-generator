/* eslint-disable no-unused-vars */
// We disable this rule as we want to always show all the arguments of each functions
// so that the API is easier to understand

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean
} = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const { resolver, defaultListArgs } = require('graphql-sequelize')
const { createContext, EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize')
const { Op } = require('sequelize')
const {
  generateApolloServer,
  generateSchema,
  generateModelTypes,
  injectAssociations
} = require('./../../lib')
const models = require('./models')

// If you want to enable the dataloader everywhere, you can do this:
// From https://github.com/mickhansen/graphql-sequelize#options
resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY }

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
  subscriptions: ['create', 'update'],
  before: [
    (args, context, info) => {
      // Global before hook only have args, context and info.
      // You can use many functions or just one.

      // Use it if you need to do something before each enpoint
      if (!context.bootDate) {
        throw new Error('Boot date is missing!')
      }

      if (info.xxx) {
        throw new Error('Xxx is provided when it should not!')
      }

      // Typical usage:
      // * Protect an endpoint
      // * Verify entity existance

      // ex:
      // if (!context.user.role !== 'admin') {
      //   throw new Error('You must be admin to use this endpoint!')
      // }

      // The function returns nothing
    }
  ],
  list: {
    removeUnusedAttributes: false,
    enforceMaxLimit: false,
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
      if (result && typeof result.length !== 'undefined') {
        for (const user of result) {
          if (user.name === 'Test 5 c 2') {
            user.name = `Mr ${user.name}`
          }
        }
      }

      return result
    },
    subscriptionFilter: (payload, args, context) => {
      // Exemple of subscription check
      if (context.user.role !== 'admin') {
        return false
      }
      return true
    }
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
    extraArg: { log: { type: GraphQLBoolean } },
    before: (where, source, args, context, info) => {
      // You can restrict the creation if needed
      return where
    },
    after: async (deletedEntity, source, args, context, info) => {
      // You can log what happened here
      if (args.log) {
        const date = Date.now()
        await models.log.create({
          message: `The User id = ${args.id} was successfully deleted`,
          createdAt: date,
          updatedAt: date
        })
      }
      return deletedEntity
    }
  }
}

graphqlSchemaDeclaration.company = {
  model: models.company,
  actions: ['list', 'create'],
  list: {
    removeUnusedAttributes: false,
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
    resolver: async (source, args, context, info) => {
      // Making custom resolvers on the list query can be useful
      // but keep in mind that it will be used at any level in the graph.

      // Here, defining our own resolver without taking into account the args
      // and the source would make that "departments" would never be returned
      // when queried outside a simple query like {department{id}}

      // Be sure to look at the source!
      if (source && source.departmentId) {
        // This call Will not be taken in account by the dataloader
        const entity = await models.department.findByPk(source.departmentId)
        return entity
      }

      if (source && source.dataValues && source.dataValues.id) {
        // Example of dataloader used for a query
        // This call will be taken in account by the dataloader
        return source.getDepartments({
          [EXPECTED_OPTIONS_KEY]: context[EXPECTED_OPTIONS_KEY]
        })
      }

      // Do not do that in production!
      // The dataloader will not be used for this query!
      return models.department.findAll({
        where: {
          id: [1, 2, 3, 4, 5, 6, 7, 8]
        }
      })
    }
  }
}

graphqlSchemaDeclaration.location = {
  model: models.location,
  actions: ['list', 'count'],
  list: {
    enforceMaxLimit: 2
  },
  count: {
    resolver: async () => {
      // You can specify you own count if needed
      const result = await models.sequelize.query(
        `SELECT count(*) as "count" FROM location`,
        { type: models.sequelize.QueryTypes.SELECT }
      )
      return result && result[0] ? result[0].count : 0
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

graphqlSchemaDeclaration.log = {
  model: models.log,
  actions: ['list', 'create']
}

// Testing the many to many relationships
graphqlSchemaDeclaration.tag = {
  model: models.tag,
  actions: ['list']
}

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
        const contextDataloader = createContext(models.sequelize)

        // Connection is provided when a webSocket is connected.
        if (connection) {
          // check connection for metadata
          return {
            ...connection.context,
            [EXPECTED_OPTIONS_KEY]: contextDataloader
          }
        }

        // This is an example of context manipulation.
        return {
          ...req,
          bootDate: '2017-01-01',
          [EXPECTED_OPTIONS_KEY]: contextDataloader
        }
      },
      // Example of socket security hook.
      subscriptions: {
        onConnect: (connectionParams, webSocket) => {
          return true
        }
      }
    },
    pubSubInstance
  })
})
