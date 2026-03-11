const { Client } = require('@modelcontextprotocol/sdk/client/index.js')
const {
  InMemoryTransport,
} = require('@modelcontextprotocol/sdk/inMemory.js')
const { generateMcpServer } = require('../../lib')
const { deleteTables } = require('./testDatabase.js')
const { resetDb } = require('./setupTestServer')
const models = require('./models')

describe('MCP create action', () => {
  let client
  let mcpServer

  beforeAll(async () => {
    await resetDb()

    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        mcpActions: ['create', 'list'],
      },
    }

    mcpServer = generateMcpServer(graphqlSchemaDeclaration, models, {
      serverInfo: { name: 'test-server', version: '1.0.0' },
    })

    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair()

    await mcpServer.connect(serverTransport)

    client = new Client({ name: 'test-client', version: '1.0.0' })
    await client.connect(clientTransport)
  })

  afterAll(async () => {
    await client.close()
    await mcpServer.close()
    await deleteTables()
  })

  beforeEach(async () => {
    await resetDb()
  })

  it('should list create tools', async () => {
    const result = await client.listTools()
    const toolNames = result.tools.map((t) => t.name)
    expect(toolNames).toContain('user_create')
  })

  it('should create a new user', async () => {
    const result = await client.callTool({
      name: 'user_create',
      arguments: {
        name: 'MCP Test User',
        companyId: 1,
        departmentId: 1,
      },
    })

    expect(result.isError).toBeFalsy()
    const data = JSON.parse(result.content[0].text)
    expect(data).toHaveProperty('id')
    expect(data.name).toBe('MCP Test User')
    expect(data.companyId).toBe(1)
    expect(data.departmentId).toBe(1)
  })

  it('should persist the created user', async () => {
    const createResult = await client.callTool({
      name: 'user_create',
      arguments: {
        name: 'Persisted MCP User',
        companyId: 1,
        departmentId: 1,
      },
    })

    const createdUser = JSON.parse(createResult.content[0].text)

    const listResult = await client.callTool({
      name: 'user_list',
      arguments: {},
    })

    const allUsers = JSON.parse(listResult.content[0].text)
    const found = allUsers.find((u) => u.id === createdUser.id)
    expect(found).toBeDefined()
    expect(found.name).toBe('Persisted MCP User')
  })

  it('should create a user with optional type field', async () => {
    const result = await client.callTool({
      name: 'user_create',
      arguments: {
        name: 'Typed MCP User',
        companyId: 1,
        departmentId: 1,
        type: 'admin',
      },
    })

    expect(result.isError).toBeFalsy()
    const data = JSON.parse(result.content[0].text)
    expect(data.type).toBe('admin')
  })
})
