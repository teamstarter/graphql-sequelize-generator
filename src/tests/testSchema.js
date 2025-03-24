/* eslint-disable no-unused-vars */
// We disable this rule as we want to always show all the arguments of each functions
// so that the API is easier to understand

const {
  generateApolloServer,
  generateModelTypes,
  injectAssociations,
  resolver,
} = require('../../lib')

const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLError,
  GraphQLInputObjectType,
} = require('graphql')
const { PubSub } = require('graphql-subscriptions')
const { defaultListArgs } = require('graphql-sequelize')
const { EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize')
const { WebSocketServer } = require('ws')

const { Op } = require('sequelize')
const models = require('./models')

// If you want to enable the dataloader everywhere, you can do this:
// From https://github.com/mickhansen/graphql-sequelize#options
resolver.contextToOptions = { [EXPECTED_OPTIONS_KEY]: EXPECTED_OPTIONS_KEY }

const graphqlSchemaDeclaration = {}
const types = generateModelTypes(models)
const pubSubInstance = new PubSub()

graphqlSchemaDeclaration.companyType = {
  model: models.companyType,
  actions: ['list', 'create'],
}

graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ['list', 'create', 'delete', 'update', 'count'],
  subscriptions: ['create', 'update'],
  webhooks: ['create', 'update', 'delete'],
  before: [
    ({ args, context, info }) => {
      // Global before hook only have args, context and info.
      // You can use many functions or just one.

      // Use it if you need to do something before each enpoint
      if (!context.bootDate) {
        throw new GraphQLError('Boot date is missing!')
      }

      if (info.xxx) {
        throw new GraphQLError('Xxx is provided when it should not!')
      }

      // Typical usage:
      // * Protect an endpoint
      // * Verify entity existance

      // ex:
      // if (!context.user.role !== 'admin') {
      //   throw new Error('You must be admin to use this endpoint!')
      // }

      // The function returns nothing
    },
  ],
  count: {
    extraArg: {
      departmentId: { type: GraphQLInt },
    },
    before: async ({ findOptions, source, args }) => {
      // example of an extra argument usage
      if (args.departmentId) {
        if (!findOptions.include) {
          findOptions.include = []
        }

        findOptions.include.push({
          model: models.company,
          include: [
            {
              model: models.department,
              required: true,
              where: {
                id: args.departmentId,
              },
            },
          ],
        })
      }

      // while keeping the list logic after
      // If you want to re-use the list before,
      // can can either call it or duplicate the code.
      // Or do not specify the extra arg in the count,
      // and declare it in the list, they will both user it.
      if (typeof findOptions.where === 'undefined') {
        findOptions.where = {}
      }
      findOptions.where = {
        [Op.and]: [findOptions.where, { departmentId: [1] }],
      }
      return findOptions
    },
  },
  list: {
    removeUnusedAttributes: false,
    enforceMaxLimit: 50,
    before: ({ findOptions, args, context, info }) => {
      if (typeof findOptions.where === 'undefined') {
        findOptions.where = {}
      }
      findOptions.where = {
        [Op.and]: [findOptions.where, { departmentId: [1] }],
      }
      return findOptions
    },
    after: ({ result, args, context, info }) => {
      if (result && Object.hasOwnProperty.call(result, 'length')) {
        for (const user of result) {
          if (user.name === 'Test 5 c 2') {
            user.name = `Mr ${user.name}`
          }
        }
      }

      return result
    },
    subscriptionFilter: ({ payload, args, context }) => {
      // Exemple of subscription check
      if (context.user.role !== 'admin') {
        return false
      }
      return true
    },
  },
  // The followings hooks are just here to demo their signatures.
  // They are not required and can be omited if you don't need them.
  create: {
    before: ({ source, args, context, info }) => {
      // You can restrict the creation if needed
      return args.user
    },
    after: async ({
      newEntity,
      source,
      args,
      context,
      info,
      setWebhookData,
    }) => {
      // You can log what happened here

      setWebhookData((defaultData) => {
        return {
          ...defaultData,
          gsg: 'This hook will be triggered ig gsg',
        }
      })

      return newEntity
    },
    preventDuplicateOnAttributes: ['type'],
    subscriptionFilter: (rootValue, args, context, info) => {
      if (args.user.name === 'Test 5 c 2') {
        return false
      }
      return true
    },
  },
  update: {
    before: ({ source, args, context, info }) => {
      // You can restrict the creation if needed
      return args.user
    },
    after: async ({
      updatedEntity,
      entitySnapshot,
      source,
      args,
      context,
      info,
    }) => {
      // You can log what happened here
      return updatedEntity
    },
  },
  delete: {
    // Adding a new argument to the delete mutation
    extraArg: { log: { type: GraphQLBoolean } },
    before: ({ where, source, args, context, info }) => {
      // You can restrict the creation if needed
      return where
    },
    after: async ({ deletedEntity, source, args, context, info }) => {
      // You can log what happened here, as the new log attribute will be propagated here
      if (args.log) {
        const date = Date.now()
        await models.log.create({
          message: `The User id = ${args.id} was successfully deleted`,
          createdAt: date,
          updatedAt: date,
        })
      }
      return deletedEntity
    },
  },
}

graphqlSchemaDeclaration.company = {
  model: models.company,
  actions: ['list', 'create', 'update'],
  subscriptions: ['create', 'update'],
  list: {
    removeUnusedAttributes: false,
    before: ({ findOptions, args, context, info }) => {
      if (typeof findOptions.where === 'undefined') {
        findOptions.where = {}
      }

      // This is an example of rights enforcement
      findOptions.where = {
        [Op.and]: [findOptions.where, { id: [1, 3, 5, 7] }],
      }
      return findOptions
    },
  },
  create: {
    type: types.outputTypes.company,
    description: 'Create a company with additional setup',
    args: {
      company: { type: types.inputTypes.company },
      setupOptions: {
        type: new GraphQLInputObjectType({
          name: 'CompanySetupOptions',
          fields: {
            createDefaultDepartment: { type: GraphQLBoolean },
            addDefaultUser: { type: GraphQLBoolean },
          },
        }),
      },
    },
    resolve: async (source, args, context) => {
      const { company, setupOptions } = args

      // Create the company
      const newCompany = await models.company.create(company)

      // Handle additional setup if requested
      if (setupOptions?.createDefaultDepartment) {
        await models.department.create({
          name: 'Default Department',
          companyId: newCompany.id,
        })
      }

      if (setupOptions?.addDefaultUser) {
        await models.user.create({
          name: 'Default User',
          companyId: newCompany.id,
          departmentId: 1,
        })
      }

      return newCompany
    },
  },
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
          [EXPECTED_OPTIONS_KEY]: context[EXPECTED_OPTIONS_KEY],
        })
      }

      // Do not do that in production!
      // The dataloader will not be used for this query!
      return models.department.findAll({
        where: {
          id: [1, 2, 3, 4, 5, 6, 7, 8],
        },
      })
    },
  },
}

graphqlSchemaDeclaration.location = {
  model: models.location,
  actions: ['list', 'count'],
  list: {
    enforceMaxLimit: 2,
  },
  count: {
    resolver: async () => {
      // You can specify you own count if needed
      const result = await models.sequelize.query(
        `SELECT count(*) as "count" FROM location`,
        { type: models.sequelize.QueryTypes.SELECT }
      )
      return result && result[0] ? result[0].count : 0
    },
  },
}

graphqlSchemaDeclaration.serverStatistics = {
  type: new GraphQLObjectType({
    name: 'serverStatistics',
    description: 'Statistics about the server',
    fields: {
      serverBootDate: { type: GraphQLString },
    },
  }),
  resolve: async (source, args, context, info) => {
    return {
      serverBootDate: context.bootDate,
    }
  },
}

const OddUser = new GraphQLObjectType({
  name: 'OddUser',
  description: 'Like an user, but only with odd ids.',
  fields: {
    handleAdditionalFields: { type: GraphQLString },
  },
})

graphqlSchemaDeclaration.log = {
  model: models.log,
  actions: ['list', 'create'],
  additionalMutations: {
    anonymizeLog: {
      type: types.outputTypes.log,
      description: 'Just a random example to test the additional mutations.',
      args: {
        logId: { type: GraphQLString },
      },
      resolve: async (source, args, context) => {
        return {
          id: 1,
          message: 'Anonymized',
        }
      },
    },
  },
}

// Testing the many to many relationships
graphqlSchemaDeclaration.tag = {
  model: models.tag,
  actions: ['list'],
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
    ...defaultListArgs(),
  },
  resolve: resolver(models.user, {
    before: async (findOptions, args, context, info) => {
      findOptions.where = {
        [Op.and]: [
          findOptions.where,
          { id: models.sequelize.literal('id % 2') },
        ],
      }
      return findOptions
    },
  }),
}

// Sometimes you want to add an action that do not match an existing model
// ex: Trigger a process
const customMutations = {}
customMutations.logThat = {
  type: new GraphQLObjectType({
    name: 'logThat',
    fields: {
      message: { type: GraphQLString },
    },
  }),
  args: {
    message: {
      type: GraphQLString,
    },
  },
  description: 'Refresh the status of the call for projects.',
  resolve: async (source, args, context, info) => {
    // Your mutation can do something here...
    console.log(args.message)

    return {
      message: args.message,
    }
  },
}

graphqlSchemaDeclaration.companySetting = {
  model: models.companySetting,
  excludeFromRoot: true,
  actions: ['list'],
}

graphqlSchemaDeclaration.userLocation = {
  model: models.userLocation,
  actions: ['list'],
  list: {
    before: async ({ findOptions }) => {
      return findOptions
    },
  },
}

module.exports = (globalPreCallback, httpServer) => {
  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: '/graphql',
  })

  return {
    server: generateApolloServer({
      graphqlSchemaDeclaration,
      customMutations,
      types,
      models,
      globalPreCallback,
      wsServer,
      apolloServerOptions: {
        // Required for the tests.
        csrfPrevention: false,
        playground: true,
      },
      callWebhook: (data) => {
        return data
      },
      pubSubInstance,
      useServerOptions: {
        context: async (ctx, msg, args) => {
          // Returning an object will add that information to
          // contextValue, which all of our resolvers have access to.
          const user = { id: 1, name: 'John', companyId: 1, role: 'admin' }
          ctx.extra.user = user
          return { ctx, msg, args }
        },
      },
    }),
  }
}
