const request = require('supertest')
const express = require('express')
const http = require('spdy')
const cors = require('cors')
const { json } = require('body-parser')
const { expressMiddleware } = require('@apollo/server/express4')
const { PubSub } = require('graphql-subscriptions')
const { Transaction } = require('sequelize')

const {
  generateApolloServer,
  generateModelTypes,
  generateSchema,
} = require('../../lib')
const models = require('./models')
const {
  deleteTables,
  migrateDatabase,
  seedDatabase,
} = require('./testDatabase.js')

/**
 * `transactional` on a declaration wraps create, update and delete in one
 * transaction each, handed to every hook. This file proves, for the three
 * actions:
 *
 *  (a) a hook that writes a second table plus a later hook that throws → both
 *      writes roll back when `transactional: true`; the first write survives
 *      when it is `false` (today's behaviour, pinned);
 *  (b) every hook, the fetch and the write receive the very transaction the
 *      resolver opened;
 *  (c) pubSub and the webhook are not called when the transaction rolls back,
 *      and only fire after the commit otherwise;
 *  (d) a non-transactional declaration passes `transaction: undefined`;
 *  (e) the per-action flag overrides the declaration-level one, and
 *      `transactionOptions` reaches `sequelize.transaction`.
 */

const FAIL_MESSAGE = 'Second hook failed on purpose'

const userCreate = (user) => ({
  query: `mutation userCreate($user: userInput!) {
    userCreate(user: $user) { id name }
  }`,
  variables: { user },
})

const userUpdate = (user) => ({
  query: `mutation userUpdate($user: userInput!) {
    userUpdate(user: $user) { id name }
  }`,
  variables: { user },
})

const userDelete = (id) => ({
  query: `mutation userDelete($id: Int!) {
    userDelete(id: $id)
  }`,
  variables: { id },
})

/**
 * Builds the `user` declaration. Every hook records the params it received in
 * `received`; a hook writes a `log` row with the transaction it is given, and
 * the hook that follows throws when `state.failAt` names it.
 */
const buildUserDeclaration = ({ received, state, ...overrides }) => {
  const record = (hook, params) => {
    received.push({
      hook,
      transaction: params.transaction,
      hasTransactionKey: 'transaction' in params,
    })
  }
  const failIf = (hook) => {
    if (state.failAt === hook) {
      throw new Error(FAIL_MESSAGE)
    }
  }
  const writeLog = (message, transaction) =>
    models.log.create({ message }, { transaction })

  return {
    model: models.user,
    actions: ['list', 'create', 'update', 'delete'],
    subscriptions: ['create', 'update', 'delete'],
    webhooks: ['create', 'update', 'delete'],
    before: (params) => {
      record('before', params)
    },
    create: {
      beforeCreate: (params) => {
        record('beforeCreate', params)
        return params.args.user
      },
      afterCreate: [
        async (params) => {
          record('afterCreate', params)
          await writeLog(
            `created ${params.createdEntity.id}`,
            params.transaction
          )
          return params.createdEntity
        },
        (params) => {
          record('afterCreate', params)
          failIf('afterCreate')
          return params.createdEntity
        },
      ],
    },
    update: {
      beforeUpdateFetch: (params) => {
        record('beforeUpdateFetch', params)
        return params.args.user
      },
      beforeUpdate: async (params) => {
        record('beforeUpdate', params)
        await writeLog(`updating ${params.entity.id}`, params.transaction)
        return params.args.user
      },
      afterUpdate: (params) => {
        record('afterUpdate', params)
        failIf('afterUpdate')
        return params.updatedEntity
      },
    },
    delete: {
      beforeDeleteFetch: (params) => {
        record('beforeDeleteFetch', params)
        return params.where
      },
      beforeDelete: async (params) => {
        record('beforeDelete', params)
        await writeLog(`deleting ${params.entity.id}`, params.transaction)
        return params.entity
      },
      afterDelete: (params) => {
        record('afterDelete', params)
        failIf('afterDelete')
        return params.deletedEntity
      },
    },
    ...overrides,
  }
}

/**
 * One server per declaration. `generateModelTypes` is called here, per
 * server, because two schemas cannot share one `types` object (see README).
 */
const createServer = async ({ declaration, pubSubInstance, callWebhook }) => {
  const app = express()
  const httpServer = http.createServer({ spdy: { plain: true } }, app)
  const server = generateApolloServer({
    graphqlSchemaDeclaration: { user: declaration },
    types: generateModelTypes(models),
    models,
    globalPreCallback: () => null,
    wsServer: null,
    apolloServerOptions: { csrfPrevention: false },
    callWebhook,
    pubSubInstance,
    useServerOptions: {},
  })
  await server.start()
  app.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, { context: async () => ({}) })
  )
  await new Promise((resolve) =>
    httpServer.listen(process.env.PORT || 8080, resolve)
  )
  return httpServer
}

const closeServer = (server) =>
  new Promise((resolve) => server.close(() => resolve()))

/**
 * Shared harness: spies on `sequelize.transaction` to capture the transaction
 * the resolver opens, on pubSub and on the webhook, recording for each call
 * the state of that transaction at the time it was made.
 */
const setupHarness = () => {
  const harness = {
    received: [],
    state: { failAt: null },
    opened: [],
    transactionCalls: [],
    published: [],
    webhookCalls: [],
    pubSubInstance: new PubSub(),
    callWebhook: null,
    reset() {
      this.received.length = 0
      this.state.failAt = null
      this.opened.length = 0
      this.transactionCalls.length = 0
      this.published.length = 0
      this.webhookCalls.length = 0
    },
    lastTransactionState() {
      const last = this.opened[this.opened.length - 1]
      return last ? last.finished : 'none'
    },
  }

  const originalTransaction = models.sequelize.transaction
  jest
    .spyOn(models.sequelize, 'transaction')
    .mockImplementation(function (options, callback) {
      harness.transactionCalls.push(options)
      return originalTransaction.call(models.sequelize, options, (t) => {
        harness.opened.push(t)
        return callback(t)
      })
    })

  jest
    .spyOn(harness.pubSubInstance, 'publish')
    .mockImplementation((event, payload) => {
      harness.published.push({
        event,
        payload,
        transactionState: harness.lastTransactionState(),
      })
    })

  harness.callWebhook = (data) => {
    harness.webhookCalls.push({
      ...data,
      transactionState: harness.lastTransactionState(),
    })
  }

  return harness
}

const resetDb = async () => {
  await migrateDatabase()
  await seedDatabase()
}

// The seeded user 5 is the one every test updates or deletes.
const USER_ID = 5

describe('Transactional mutations (transactional: true)', () => {
  let server = null
  let harness = null
  // Spies on the model, restored after every test so a failure cannot leak
  // one into the next test (spying twice on a method reuses the first spy).
  let modelSpies = []
  const spyOn = (target, method) => {
    const spy = jest.spyOn(target, method)
    modelSpies.push(spy)
    return spy
  }

  beforeAll(async () => {
    harness = setupHarness()
    server = await createServer({
      declaration: buildUserDeclaration({
        received: harness.received,
        state: harness.state,
        transactional: true,
        transactionOptions: {
          isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
        },
      }),
      pubSubInstance: harness.pubSubInstance,
      callWebhook: harness.callWebhook,
    })
  })

  afterAll(async () => {
    await closeServer(server)
    jest.restoreAllMocks()
  })

  beforeEach(async () => {
    harness.reset()
    await resetDb()
  })

  afterEach(async () => {
    modelSpies.forEach((spy) => spy.mockRestore())
    modelSpies = []
    await deleteTables()
  })

  describe('update', () => {
    it('rolls back the hook write and the update when a later hook throws', async () => {
      harness.state.failAt = 'afterUpdate'
      const before = await models.user.findByPk(USER_ID)

      const response = await request(server)
        .post('/graphql')
        .send(userUpdate({ id: USER_ID, name: 'edited name' }))

      expect(response.body.errors).toHaveLength(1)
      expect(response.body.errors[0].message).toBe(FAIL_MESSAGE)
      expect(response.body.data.userUpdate).toBeNull()

      const after = await models.user.findByPk(USER_ID)
      expect(after.name).toBe(before.name)
      expect(await models.log.count()).toBe(0)

      expect(harness.opened).toHaveLength(1)
      expect(harness.opened[0].finished).toBe('rollback')
      // (c) nothing leaves the process when the transaction rolls back
      expect(harness.published).toHaveLength(0)
      expect(harness.webhookCalls).toHaveLength(0)
    })

    it('hands the same transaction to every hook, the fetch and the write, then publishes after the commit', async () => {
      const findOne = spyOn(models.user, 'findOne')
      const update = spyOn(models.user.prototype, 'update')

      const response = await request(server)
        .post('/graphql')
        .send(userUpdate({ id: USER_ID, name: 'edited name' }))
      // The resolver's fetch and the reload, before our own findByPk below.
      const fetchCalls = findOne.mock.calls.slice()

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.userUpdate.name).toBe('edited name')
      expect((await models.user.findByPk(USER_ID)).name).toBe('edited name')
      expect(await models.log.count()).toBe(1)

      expect(harness.opened).toHaveLength(1)
      const transaction = harness.opened[0]
      expect(transaction).toBeInstanceOf(Transaction)
      expect(transaction.finished).toBe('commit')
      expect(harness.transactionCalls[0]).toEqual({
        isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
      })

      // (b) the hooks, in order, each with the resolver's transaction
      expect(harness.received.map((r) => r.hook)).toEqual([
        'before',
        'beforeUpdateFetch',
        'beforeUpdate',
        'afterUpdate',
      ])
      for (const call of harness.received) {
        expect(call.transaction).toBe(transaction)
      }
      expect(fetchCalls).toHaveLength(2)
      for (const [options] of fetchCalls) {
        expect(options.transaction).toBe(transaction)
      }
      expect(update).toHaveBeenCalledTimes(1)
      expect(update.mock.calls[0][1].transaction).toBe(transaction)

      // (c) pubSub and the webhook fire once, after the commit
      expect(harness.published).toHaveLength(1)
      expect(harness.published[0].event).toBe('userUpdated')
      expect(harness.published[0].transactionState).toBe('commit')
      expect(harness.webhookCalls).toHaveLength(1)
      expect(harness.webhookCalls[0].eventType).toBe('user-updated')
      expect(harness.webhookCalls[0].transactionState).toBe('commit')
    })
  })

  describe('delete', () => {
    it('rolls back the hook write and the destroy when a later hook throws', async () => {
      harness.state.failAt = 'afterDelete'

      const response = await request(server)
        .post('/graphql')
        .send(userDelete(USER_ID))

      expect(response.body.errors).toHaveLength(1)
      expect(response.body.errors[0].message).toBe(FAIL_MESSAGE)

      expect(await models.user.findByPk(USER_ID)).not.toBeNull()
      expect(await models.log.count()).toBe(0)

      expect(harness.opened).toHaveLength(1)
      expect(harness.opened[0].finished).toBe('rollback')
      expect(harness.published).toHaveLength(0)
      expect(harness.webhookCalls).toHaveLength(0)
    })

    it('hands the same transaction to every hook, the fetch and the destroy, then publishes after the commit', async () => {
      const findOne = spyOn(models.user, 'findOne')
      const destroy = spyOn(models.user.prototype, 'destroy')

      const response = await request(server)
        .post('/graphql')
        .send(userDelete(USER_ID))
      const fetchCalls = findOne.mock.calls.slice()

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.userDelete).toBe(1)
      expect(await models.user.findByPk(USER_ID)).toBeNull()
      expect(await models.log.count()).toBe(1)

      expect(harness.opened).toHaveLength(1)
      const transaction = harness.opened[0]
      expect(transaction.finished).toBe('commit')

      expect(harness.received.map((r) => r.hook)).toEqual([
        'before',
        'beforeDeleteFetch',
        'beforeDelete',
        'afterDelete',
      ])
      for (const call of harness.received) {
        expect(call.transaction).toBe(transaction)
      }
      expect(fetchCalls).toHaveLength(1)
      expect(fetchCalls[0][0].transaction).toBe(transaction)
      expect(destroy).toHaveBeenCalledTimes(1)
      expect(destroy.mock.calls[0][0].transaction).toBe(transaction)

      expect(harness.published).toHaveLength(1)
      expect(harness.published[0].event).toBe('userDeleted')
      expect(harness.published[0].payload.userDeleted.id).toBe(USER_ID)
      expect(harness.published[0].transactionState).toBe('commit')
      expect(harness.webhookCalls).toHaveLength(1)
      expect(harness.webhookCalls[0].eventType).toBe('user-deleted')
      expect(harness.webhookCalls[0].transactionState).toBe('commit')
    })
  })

  describe('create', () => {
    const newUser = { name: 'brand new user', companyId: 1, departmentId: 1 }

    it('rolls back the hook write and the insert when a later hook throws', async () => {
      harness.state.failAt = 'afterCreate'

      const response = await request(server)
        .post('/graphql')
        .send(userCreate(newUser))

      expect(response.body.errors).toHaveLength(1)
      expect(response.body.errors[0].message).toBe(FAIL_MESSAGE)

      expect(
        await models.user.findOne({ where: { name: newUser.name } })
      ).toBeNull()
      expect(await models.log.count()).toBe(0)

      expect(harness.opened).toHaveLength(1)
      expect(harness.opened[0].finished).toBe('rollback')
      expect(harness.published).toHaveLength(0)
      expect(harness.webhookCalls).toHaveLength(0)
    })

    it('hands the same transaction to every hook and the insert, then publishes after the commit', async () => {
      const create = spyOn(models.user, 'create')

      const response = await request(server)
        .post('/graphql')
        .send(userCreate(newUser))

      expect(response.body.errors).toBeUndefined()
      expect(response.body.data.userCreate.name).toBe(newUser.name)
      const created = await models.user.findOne({
        where: { name: newUser.name },
      })
      expect(created).not.toBeNull()
      expect(await models.log.count()).toBe(1)

      expect(harness.opened).toHaveLength(1)
      const transaction = harness.opened[0]
      expect(transaction.finished).toBe('commit')

      expect(harness.received.map((r) => r.hook)).toEqual([
        'before',
        'beforeCreate',
        'afterCreate',
        'afterCreate',
      ])
      for (const call of harness.received) {
        expect(call.transaction).toBe(transaction)
      }
      expect(create).toHaveBeenCalledTimes(1)
      expect(create.mock.calls[0][1].transaction).toBe(transaction)

      expect(harness.published).toHaveLength(1)
      expect(harness.published[0].event).toBe('userCreated')
      expect(harness.published[0].transactionState).toBe('commit')
      expect(harness.webhookCalls).toHaveLength(1)
      expect(harness.webhookCalls[0].eventType).toBe('user-created')
      expect(harness.webhookCalls[0].transactionState).toBe('commit')
    })
  })
})

describe('Non-transactional mutations (the default)', () => {
  let server = null
  let harness = null

  beforeAll(async () => {
    harness = setupHarness()
    server = await createServer({
      // No `transactional` key at all: this is the default every existing
      // declaration relies on.
      declaration: buildUserDeclaration({
        received: harness.received,
        state: harness.state,
      }),
      pubSubInstance: harness.pubSubInstance,
      callWebhook: harness.callWebhook,
    })
  })

  afterAll(async () => {
    await closeServer(server)
    jest.restoreAllMocks()
  })

  beforeEach(async () => {
    harness.reset()
    await resetDb()
  })

  afterEach(() => deleteTables())

  const expectNoTransaction = (hooks) => {
    expect(harness.opened).toHaveLength(0)
    expect(harness.transactionCalls).toHaveLength(0)
    expect(harness.received.map((r) => r.hook)).toEqual(hooks)
    // (d) the key is there, holding `undefined`
    for (const call of harness.received) {
      expect(call.hasTransactionKey).toBe(true)
      expect(call.transaction).toBeUndefined()
    }
  }

  it('update: the hook write and the update survive a later hook throwing', async () => {
    harness.state.failAt = 'afterUpdate'

    const response = await request(server)
      .post('/graphql')
      .send(userUpdate({ id: USER_ID, name: 'edited name' }))

    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].message).toBe(FAIL_MESSAGE)

    // Pinned: without a transaction nothing is undone.
    expect((await models.user.findByPk(USER_ID)).name).toBe('edited name')
    expect(await models.log.count()).toBe(1)
    expectNoTransaction([
      'before',
      'beforeUpdateFetch',
      'beforeUpdate',
      'afterUpdate',
    ])
    expect(harness.published).toHaveLength(0)
    expect(harness.webhookCalls).toHaveLength(0)
  })

  it('update: passes transaction: undefined to every hook and publishes on success', async () => {
    const findOne = jest.spyOn(models.user, 'findOne')

    const response = await request(server)
      .post('/graphql')
      .send(userUpdate({ id: USER_ID, name: 'edited name' }))

    const fetchCalls = findOne.mock.calls.slice()
    findOne.mockRestore()

    expect(response.body.errors).toBeUndefined()
    expectNoTransaction([
      'before',
      'beforeUpdateFetch',
      'beforeUpdate',
      'afterUpdate',
    ])
    expect(fetchCalls).toHaveLength(2)
    for (const [options] of fetchCalls) {
      expect(options.transaction).toBeUndefined()
    }
    expect(harness.published).toHaveLength(1)
    expect(harness.published[0].event).toBe('userUpdated')
    expect(harness.webhookCalls).toHaveLength(1)
  })

  it('delete: the hook write and the destroy survive a later hook throwing', async () => {
    harness.state.failAt = 'afterDelete'

    const response = await request(server)
      .post('/graphql')
      .send(userDelete(USER_ID))

    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].message).toBe(FAIL_MESSAGE)

    expect(await models.user.findByPk(USER_ID)).toBeNull()
    expect(await models.log.count()).toBe(1)
    expectNoTransaction([
      'before',
      'beforeDeleteFetch',
      'beforeDelete',
      'afterDelete',
    ])
    expect(harness.published).toHaveLength(0)
    expect(harness.webhookCalls).toHaveLength(0)
  })

  it('delete: passes transaction: undefined to every hook and publishes on success', async () => {
    const response = await request(server)
      .post('/graphql')
      .send(userDelete(USER_ID))

    expect(response.body.errors).toBeUndefined()
    expect(response.body.data.userDelete).toBe(1)
    expectNoTransaction([
      'before',
      'beforeDeleteFetch',
      'beforeDelete',
      'afterDelete',
    ])
    expect(harness.published).toHaveLength(1)
    expect(harness.published[0].event).toBe('userDeleted')
    expect(harness.webhookCalls).toHaveLength(1)
  })

  it('create: the hook write and the insert survive a later hook throwing', async () => {
    harness.state.failAt = 'afterCreate'
    const newUser = { name: 'brand new user', companyId: 1, departmentId: 1 }

    const response = await request(server)
      .post('/graphql')
      .send(userCreate(newUser))

    expect(response.body.errors).toHaveLength(1)
    expect(response.body.errors[0].message).toBe(FAIL_MESSAGE)

    expect(
      await models.user.findOne({ where: { name: newUser.name } })
    ).not.toBeNull()
    expect(await models.log.count()).toBe(1)
    expectNoTransaction([
      'before',
      'beforeCreate',
      'afterCreate',
      'afterCreate',
    ])
    expect(harness.published).toHaveLength(0)
    expect(harness.webhookCalls).toHaveLength(0)
  })

  it('create: passes transaction: undefined to every hook and publishes on success', async () => {
    const newUser = { name: 'brand new user', companyId: 1, departmentId: 1 }

    const response = await request(server)
      .post('/graphql')
      .send(userCreate(newUser))

    expect(response.body.errors).toBeUndefined()
    expectNoTransaction([
      'before',
      'beforeCreate',
      'afterCreate',
      'afterCreate',
    ])
    expect(harness.published).toHaveLength(1)
    expect(harness.published[0].event).toBe('userCreated')
    expect(harness.webhookCalls).toHaveLength(1)
  })
})

describe('Per-action override of transactional', () => {
  let server = null
  let harness = null

  beforeAll(async () => {
    harness = setupHarness()
    const base = buildUserDeclaration({
      received: harness.received,
      state: harness.state,
      transactional: false,
    })
    server = await createServer({
      declaration: {
        ...base,
        // Only update opts in, with its own options.
        update: {
          ...base.update,
          transactional: true,
          transactionOptions: {
            isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
          },
        },
      },
      pubSubInstance: harness.pubSubInstance,
      callWebhook: harness.callWebhook,
    })
  })

  afterAll(async () => {
    await closeServer(server)
    jest.restoreAllMocks()
  })

  beforeEach(async () => {
    harness.reset()
    await resetDb()
  })

  afterEach(() => deleteTables())

  it('update.transactional: true wins over the declaration-level false, with its own options', async () => {
    harness.state.failAt = 'afterUpdate'
    const before = await models.user.findByPk(USER_ID)

    const response = await request(server)
      .post('/graphql')
      .send(userUpdate({ id: USER_ID, name: 'edited name' }))

    expect(response.body.errors[0].message).toBe(FAIL_MESSAGE)
    expect((await models.user.findByPk(USER_ID)).name).toBe(before.name)
    expect(await models.log.count()).toBe(0)
    expect(harness.opened).toHaveLength(1)
    expect(harness.opened[0].finished).toBe('rollback')
    expect(harness.transactionCalls[0]).toEqual({
      isolationLevel: Transaction.ISOLATION_LEVELS.READ_UNCOMMITTED,
    })
    for (const call of harness.received) {
      expect(call.transaction).toBe(harness.opened[0])
    }
  })

  it('create and delete stay non-transactional', async () => {
    harness.state.failAt = 'afterDelete'
    const response = await request(server)
      .post('/graphql')
      .send(userDelete(USER_ID))

    expect(response.body.errors[0].message).toBe(FAIL_MESSAGE)
    expect(await models.user.findByPk(USER_ID)).toBeNull()
    expect(await models.log.count()).toBe(1)
    expect(harness.opened).toHaveLength(0)
    for (const call of harness.received) {
      expect(call.hasTransactionKey).toBe(true)
      expect(call.transaction).toBeUndefined()
    }

    harness.reset()
    await request(server)
      .post('/graphql')
      .send(
        userCreate({ name: 'brand new user', companyId: 1, departmentId: 1 })
      )
    expect(harness.opened).toHaveLength(0)
    expect(harness.received.map((r) => r.hook)).toEqual([
      'before',
      'beforeCreate',
      'afterCreate',
      'afterCreate',
    ])
    for (const call of harness.received) {
      expect(call.transaction).toBeUndefined()
    }
  })
})

describe('Transaction settings are validated at schema build time', () => {
  // One `types` object per schema, as always.
  const build = (user) =>
    generateSchema({
      graphqlSchemaDeclaration: { user },
      types: generateModelTypes(models),
      models,
      globalPreCallback: () => null,
      pubSubInstance: null,
      callWebhook: () => null,
    })

  const base = { model: models.user, actions: ['create', 'update', 'delete'] }

  it('accepts a boolean flag and options next to it', () => {
    expect(() =>
      build({ ...base, transactional: true, transactionOptions: {} })
    ).not.toThrow()
    expect(() =>
      build({
        ...base,
        transactionOptions: {},
        update: { transactional: true },
      })
    ).not.toThrow()
    expect(() =>
      build({
        ...base,
        update: { transactional: true, transactionOptions: {} },
      })
    ).not.toThrow()
  })

  it('rejects a non-boolean transactional', () => {
    expect(() => build({ ...base, transactional: 'true' })).toThrow(
      'user.transactional must be a boolean, got "true".'
    )
    expect(() => build({ ...base, delete: { transactional: 1 } })).toThrow(
      'user.delete.transactional must be a boolean, got 1.'
    )
  })

  it('rejects transactionOptions that nothing would read', () => {
    expect(() => build({ ...base, transactionOptions: {} })).toThrow(
      'user.transactionOptions is set but no mutation of user is transactional'
    )
    expect(() =>
      build({ ...base, update: { transactionOptions: {} } })
    ).toThrow(
      'user.update.transactionOptions is set but the update mutation is not transactional'
    )
    // Declaration-level true, action-level false: the action's own options are dead.
    expect(() =>
      build({
        ...base,
        transactional: true,
        delete: { transactional: false, transactionOptions: {} },
      })
    ).toThrow('user.delete.transactionOptions is set')
  })
})
