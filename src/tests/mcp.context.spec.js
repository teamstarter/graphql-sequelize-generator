const { Client } = require('@modelcontextprotocol/sdk/client/index.js')
const {
  InMemoryTransport,
} = require('@modelcontextprotocol/sdk/inMemory.js')
const { generateMcpServer } = require('../../lib')
const { deleteTables } = require('./testDatabase.js')
const { resetDb } = require('./setupTestServer')
const models = require('./models')

describe('MCP context and hooks', () => {
  afterAll(async () => {
    await deleteTables()
  })

  beforeEach(async () => {
    await resetDb()
  })

  it('should pass context from context function to before hooks', async () => {
    let receivedContext = null

    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        mcpActions: ['list'],
        before: [
          ({ args, context, info }) => {
            receivedContext = context
          },
        ],
        list: {},
      },
    }

    const mcpServer = generateMcpServer(graphqlSchemaDeclaration, models, {
      serverInfo: { name: 'test-server', version: '1.0.0' },
      context: (extra) => ({
        user: { id: 1, name: 'admin', role: 'admin' },
        bootDate: 12345,
      }),
    })

    const [ct, st] = InMemoryTransport.createLinkedPair()
    await mcpServer.connect(st)

    const client = new Client({ name: 'test-client', version: '1.0.0' })
    await client.connect(ct)

    await client.callTool({ name: 'user_list', arguments: {} })

    expect(receivedContext).not.toBeNull()
    expect(receivedContext.user.name).toBe('admin')
    expect(receivedContext.user.role).toBe('admin')
    expect(receivedContext.bootDate).toBe(12345)

    await client.close()
    await mcpServer.close()
  })

  it('should reject in global before hook (auth check)', async () => {
    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        mcpActions: ['create'],
        before: [
          ({ args, context }) => {
            if (!context.user || context.user.role !== 'admin') {
              throw new Error('Unauthorized: admin role required')
            }
          },
        ],
        create: {},
      },
    }

    // Test with unauthorized context
    const mcpServer = generateMcpServer(graphqlSchemaDeclaration, models, {
      serverInfo: { name: 'test-server', version: '1.0.0' },
      context: () => ({
        user: { id: 2, name: 'viewer', role: 'viewer' },
      }),
    })

    const [ct, st] = InMemoryTransport.createLinkedPair()
    await mcpServer.connect(st)

    const client = new Client({ name: 'test-client', version: '1.0.0' })
    await client.connect(ct)

    const result = await client.callTool({
      name: 'user_create',
      arguments: { name: 'Hacker', companyId: 1, departmentId: 1 },
    })

    expect(result.isError).toBe(true)
    expect(result.content[0].text).toContain('Unauthorized')

    await client.close()
    await mcpServer.close()
  })

  it('should allow when context passes auth check', async () => {
    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        mcpActions: ['create'],
        before: [
          ({ args, context }) => {
            if (!context.user || context.user.role !== 'admin') {
              throw new Error('Unauthorized: admin role required')
            }
          },
        ],
        create: {},
      },
    }

    const mcpServer = generateMcpServer(graphqlSchemaDeclaration, models, {
      serverInfo: { name: 'test-server', version: '1.0.0' },
      context: () => ({
        user: { id: 1, name: 'admin', role: 'admin' },
      }),
    })

    const [ct, st] = InMemoryTransport.createLinkedPair()
    await mcpServer.connect(st)

    const client = new Client({ name: 'test-client', version: '1.0.0' })
    await client.connect(ct)

    const result = await client.callTool({
      name: 'user_create',
      arguments: { name: 'Legit User', companyId: 1, departmentId: 1 },
    })

    expect(result.isError).toBeFalsy()
    const data = JSON.parse(result.content[0].text)
    expect(data.name).toBe('Legit User')

    await client.close()
    await mcpServer.close()
  })

  it('should pass context to action-specific before hooks', async () => {
    let receivedContextInCreateBefore = null

    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        mcpActions: ['create'],
        create: {
          before: [
            ({ source, args, context, info }) => {
              receivedContextInCreateBefore = context
              return args.user
            },
          ],
        },
      },
    }

    const mcpServer = generateMcpServer(graphqlSchemaDeclaration, models, {
      serverInfo: { name: 'test-server', version: '1.0.0' },
      context: () => ({
        tenant: 'acme-corp',
        user: { id: 1 },
      }),
    })

    const [ct, st] = InMemoryTransport.createLinkedPair()
    await mcpServer.connect(st)

    const client = new Client({ name: 'test-client', version: '1.0.0' })
    await client.connect(ct)

    await client.callTool({
      name: 'user_create',
      arguments: { name: 'Hook Test User', companyId: 1, departmentId: 1 },
    })

    expect(receivedContextInCreateBefore).not.toBeNull()
    expect(receivedContextInCreateBefore.tenant).toBe('acme-corp')
    expect(receivedContextInCreateBefore.user.id).toBe(1)

    await client.close()
    await mcpServer.close()
  })

  it('should pass context to delete before/after hooks', async () => {
    let deleteBeforeContext = null
    let deleteAfterContext = null

    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        mcpActions: ['delete'],
        delete: {
          before: [
            ({ where, source, args, context, info }) => {
              deleteBeforeContext = context
              return where
            },
          ],
          after: [
            ({ deletedEntity, source, args, context, info }) => {
              deleteAfterContext = context
            },
          ],
        },
      },
    }

    const mcpServer = generateMcpServer(graphqlSchemaDeclaration, models, {
      serverInfo: { name: 'test-server', version: '1.0.0' },
      context: () => ({
        auditLog: true,
        user: { id: 1, name: 'admin' },
      }),
    })

    const [ct, st] = InMemoryTransport.createLinkedPair()
    await mcpServer.connect(st)

    const client = new Client({ name: 'test-client', version: '1.0.0' })
    await client.connect(ct)

    const existingUser = await models.user.findOne()
    await client.callTool({
      name: 'user_delete',
      arguments: { id: existingUser.id },
    })

    expect(deleteBeforeContext).not.toBeNull()
    expect(deleteBeforeContext.auditLog).toBe(true)
    expect(deleteBeforeContext.user.name).toBe('admin')

    expect(deleteAfterContext).not.toBeNull()
    expect(deleteAfterContext.auditLog).toBe(true)

    await client.close()
    await mcpServer.close()
  })

  it('should support async context function', async () => {
    let receivedContext = null

    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        mcpActions: ['count'],
        before: [
          ({ context }) => {
            receivedContext = context
          },
        ],
        count: {},
      },
    }

    const mcpServer = generateMcpServer(graphqlSchemaDeclaration, models, {
      serverInfo: { name: 'test-server', version: '1.0.0' },
      context: async (extra) => {
        // Simulate async context resolution (e.g., DB lookup, JWT decode)
        return {
          user: { id: 42, name: 'async-user' },
          sessionId: extra.sessionId,
        }
      },
    })

    const [ct, st] = InMemoryTransport.createLinkedPair()
    await mcpServer.connect(st)

    const client = new Client({ name: 'test-client', version: '1.0.0' })
    await client.connect(ct)

    await client.callTool({ name: 'user_count', arguments: {} })

    expect(receivedContext).not.toBeNull()
    expect(receivedContext.user.id).toBe(42)
    expect(receivedContext.user.name).toBe('async-user')

    await client.close()
    await mcpServer.close()
  })
})
