/* eslint-disable no-unused-vars */
// We disable this rule as we want to always show all the arguments of each functions
// so that the API is easier to understand

const {
  filterDeclarationByProfile,
  generateApolloServer,
  generateModelTypes,
  injectAssociations,
  resolver,
  injectHooks,
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

let graphqlSchemaDeclaration = {}
const types = generateModelTypes(models)
const pubSubInstance = new PubSub()

// PROFILES
//
// A declaration can serve several audiences at once. The endpoints below carry
// a `profiles` key describing what each audience gets, and
// `filterDeclarationByProfile` builds one schema per audience from this single
// declaration.
//
// Not every endpoint needs one. An endpoint with no `profiles` key — this one,
// `tag`, `session`, `location` — is simply absent from every profile's schema,
// which is what makes a newly added endpoint private by default.
//
// The two profiles used as examples here:
//   'read-only'  — queries only, no Mutation type at all
//   'read-write' — queries plus a narrow set of mutations
//
// NOTE: a server built for a profile must not share its `types` with another
// build. `injectAssociations` mutates `outputTypes[name]._fields` in place and
// guards on `associationsInjected`, so a second build against the same module
// instance silently reuses the first build's associations and prunes nothing.
// `profileServer.spec.js` therefore builds exactly one server per test file.
graphqlSchemaDeclaration.companyType = {
  model: models.companyType,
  actions: ['list', 'create'],
  // No profiles, on purpose: this is what proves `company.type` is pruned from
  // the profile schemas rather than merely absent from their root.
}

graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ['list', 'create', 'delete', 'update', 'count'],
  subscriptions: ['create', 'update'],
  webhooks: ['create', 'update', 'delete'],
  profiles: {
    'read-only': { actions: ['list', 'count'] },
    // `webhooks` is an event flag, so the profile names a subset of the
    // endpoint's own. Naming one the endpoint does not declare throws at build
    // time. Nothing is inherited: the profile names no `subscriptions`, so this
    // audience gets none.
    'read-write': { actions: ['list', 'count', 'update'], webhooks: ['update'] },
  },
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
    beforeList: [
      async ({ findOptions, source, args }) => {
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
    ],
  },
  list: {
    removeUnusedAttributes: false,
    enforceMaxLimit: 50,
    beforeList: [
      ({ findOptions, args, context, info }) => {
        findOptions.where = {
          [Op.and]: [findOptions.where, { departmentId: [1] }],
        }
        return findOptions
      },
    ],
    afterList: ({ result, args, context, info }) => {
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
    beforeCreate: ({ source, args, context, info }) => {
      // You can restrict the creation if needed
      return args.user
    },
    afterCreate: [
      async ({
        createdEntity,
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

        return createdEntity
      },
    ],
    preventDuplicateOnAttributes: ['type'],
    subscriptionFilter: (rootValue, args, context, info) => {
      if (args.user.name === 'Test 5 c 2') {
        return false
      }
      return true
    },
  },
  update: {
    beforeUpdateFetch: [
      ({ source, args, context, info }) => {
        // You can restrict the creation if needed
        return args.user
      },
    ],
    afterUpdate: async ({
      updatedEntity,
      previousPropertiesSnapshot,
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
    beforeDeleteFetch: ({ where, source, args, context, info }) => {
      // You can restrict the creation if needed
      return where
    },
    afterDelete: async ({ deletedEntity, source, args, context, info }) => {
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
  profiles: {
    'read-only': { actions: ['list'] },
    'read-write': {
      actions: ['list', 'create', 'update'],
      subscriptions: ['update'],
    },
  },
  list: {
    removeUnusedAttributes: false,
    beforeList: [
      ({ findOptions, args, context, info }) => {
        // This is an example of rights enforcement
        findOptions.where = {
          [Op.and]: [findOptions.where, { id: [1, 3, 5, 7] }],
        }
        return findOptions
      },
    ],
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
  // `excludeFromRoot` in a profile keeps the model reachable through an
  // association — `company { departments { … } }` — while removing its root
  // query. Useful when an audience should see a nested entity but not be able
  // to enumerate every row of it.
  profiles: {
    'read-only': { actions: ['list'], excludeFromRoot: true },
    'read-write': { actions: ['list'], excludeFromRoot: true },
  },
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
  profiles: {
    // Read for one audience, read plus one custom mutation for the other.
    'read-only': { actions: ['list'] },
    'read-write': { actions: ['list'] },
  },
  additionalMutations: {
    anonymizeLog: {
      type: types.outputTypes.log,
      description: 'Just a random example to test the additional mutations.',
      // `additionalMutations` is a map of named entries, so each entry declares
      // its own exposure right here rather than being listed on the parent
      // profile. Absent from 'read-only', so that audience keeps no Mutation
      // type at all — the emptied map is removed rather than left as `{}`,
      // which would build an invalid empty Root_Mutations.
      profiles: { 'read-write': {} },
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

/**
 * Built from the declaration that is actually being served, NOT at module load.
 *
 * `injectAssociations` walks the whole association graph and marks each output
 * type `associationsInjected`. Calling it here at module level with the full
 * declaration would inject every association into `types.outputTypes` before
 * any profile filtering happened, and the later build would skip them as
 * already-injected — so a profile schema would keep associations it should
 * have pruned. Any custom endpoint that calls injectAssociations must be built
 * after the declaration is filtered.
 */
const buildOddUserType = declaration =>
  new GraphQLList(
    injectAssociations(
      OddUser,
      declaration,
      types.outputTypes,
      models,
      () => null,
      'user'
    )
  )

graphqlSchemaDeclaration.oddUser = {
  // A custom endpoint is a plain GraphQLFieldConfig — no model, no actions —
  // so its profile entry is empty: it is either in the audience's schema or it
  // is not.
  profiles: { 'read-only': {}, 'read-write': {} },
  // `type` is assigned in the setup function below, from the served declaration.
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
  // Top-level custom mutations declare their exposure the same way endpoints
  // do. The customMutations map is filtered through the very same
  // `filterDeclarationByProfile` call, which is why its signature accepts a
  // MutationList as well as a schema declaration.
  profiles: { 'read-write': {} },
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
    beforeList: async ({ findOptions }) => {
      return findOptions
    },
  },
}

graphqlSchemaDeclaration.session = {
  model: models.session,
  actions: ['list'],
  list: {
    resolver: async (source, args, context, info) => {
      console.log('Custom resolver called')
      const sessions = await models.session.findAll({
        include: [
          {
            model: models.user,
            as: 'user',
          },
        ],
      })
      console.log('Found sessions:', sessions.length)
      return sessions
    },
  },
}

module.exports = (
  globalPreCallback,
  httpServer,
  withGeneratedHooks = false,
  profile = null
) => {
  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if app.use
    // serves expressMiddleware at a different path
    path: '/graphql',
  })

  const protectedModels = ['user', 'company']

  if (withGeneratedHooks) {
    graphqlSchemaDeclaration = injectHooks({
      graphqlSchemaDeclaration,
      injectFunctions: {
        listBefore: (models, hooks) => {
          // Ensure the last hook enforce the rights
          hooks.push(({ findOptions }) => {
            if (protectedModels.includes(models.name)) {
              findOptions.where = {
                [Op.and]: [findOptions.where, { id: 1 }],
              }
            }
            return findOptions
          })
          return hooks
        },
        listAfter: (models, hooks) => {
          hooks.push(({ result }) => {
            if (Array.isArray(result)) {
              result.forEach((item) => {
                if (item.name) {
                  item.name = `[LIST] ${item.name}`
                }
              })
            }
            return result
          })
          return hooks
        },
        createBefore: (models, hooks) => {
          hooks.push(({ source, args, context, info }) => {
            if (args.user && args.user.name) {
              args.user.name = `[CREATE] ${args.user.name}`
            }
            return args.user
          })
          return hooks
        },
        createAfter: (models, hooks) => {
          hooks.push(
            ({
              createdEntity,
              source,
              args,
              context,
              info,
              setWebhookData,
            }) => {
              if (createdEntity.name) {
                createdEntity.name = `${createdEntity.name} [CREATED]`
              }
              return createdEntity
            }
          )
          return hooks
        },
        updateBeforeFetch: (models, hooks) => {
          hooks.push(({ source, args, context, info }) => {
            if (args.user && args.user.name) {
              args.user.name = `[UPDATE] ${args.user.name}`
            }
            return args.user
          })
          return hooks
        },
        updateAfter: (models, hooks) => {
          hooks.push(
            ({
              updatedEntity,
              previousPropertiesSnapshot,
              source,
              args,
              context,
              info,
            }) => {
              if (updatedEntity.name) {
                updatedEntity.name = `${updatedEntity.name} [UPDATED]`
              }
              return updatedEntity
            }
          )
          return hooks
        },
        deleteBeforeFetch: (models, hooks) => {
          hooks.push(({ where, source, args, context, info }) => {
            // Add a timestamp to the where clause
            console.log(`[DELETE] Will delete Entity ${where.id}.`)
            return where
          })
          return hooks
        },
        deleteAfter: (models, hooks) => {
          hooks.push(({ deletedEntity, source, args, context, info }) => {
            // Log the deletion
            console.log(`[DELETE] Entity ${deletedEntity.id} was deleted`)
            return deletedEntity
          })
          return hooks
        },
      },
    })
  }

  // Build for one audience instead of the full schema.
  //
  // customMutations is passed only when something survives the filter: it is
  // spread as `!!customMutations` by generateSchema, so an empty `{}` would
  // build an invalid empty Root_Mutations and GraphQL would reject the schema.
  let declaration = graphqlSchemaDeclaration
  let mutations = customMutations

  if (profile) {
    declaration = filterDeclarationByProfile(graphqlSchemaDeclaration, profile)

    const filteredMutations = filterDeclarationByProfile(customMutations, profile)
    mutations = Object.keys(filteredMutations).length ? filteredMutations : null
  }

  // Custom endpoints that call injectAssociations are built HERE, from the
  // served declaration — never at module load. See buildOddUserType.
  if (declaration.oddUser) {
    declaration.oddUser.type = buildOddUserType(declaration)
  }

  return {
    server: generateApolloServer({
      graphqlSchemaDeclaration: declaration,
      ...(mutations ? { customMutations: mutations } : {}),
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
