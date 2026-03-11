const { Client } = require('@modelcontextprotocol/sdk/client/index.js')
const {
  InMemoryTransport,
} = require('@modelcontextprotocol/sdk/inMemory.js')
const { generateMcpServer } = require('../../lib')
const { deleteTables } = require('./testDatabase.js')
const { resetDb } = require('./setupTestServer')
const models = require('./models')

describe('MCP list action', () => {
  let client
  let mcpServer

  beforeAll(async () => {
    await resetDb()

    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        mcpActions: ['list'],
      },
      department: {
        model: models.department,
        mcpActions: ['list'],
        excludeFields: ['company', 'updatedAt'],
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

  it('should list available tools including list tools', async () => {
    const result = await client.listTools()
    const toolNames = result.tools.map((t) => t.name)
    expect(toolNames).toContain('user_list')
    expect(toolNames).toContain('department_list')
  })

  it('should list all users', async () => {
    const result = await client.callTool({
      name: 'user_list',
      arguments: {},
    })

    expect(result.isError).toBeFalsy()
    const data = JSON.parse(result.content[0].text)
    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('name')
  })

  it('should support limit parameter', async () => {
    const result = await client.callTool({
      name: 'user_list',
      arguments: { limit: 2 },
    })

    expect(result.isError).toBeFalsy()
    const data = JSON.parse(result.content[0].text)
    expect(data.length).toBeLessThanOrEqual(2)
  })

  it('should support offset parameter', async () => {
    const allResult = await client.callTool({
      name: 'user_list',
      arguments: {},
    })
    const allData = JSON.parse(allResult.content[0].text)

    const offsetResult = await client.callTool({
      name: 'user_list',
      arguments: { offset: 1, limit: 2 },
    })
    const offsetData = JSON.parse(offsetResult.content[0].text)

    expect(offsetData[0].id).toBe(allData[1].id)
  })

  it('should not generate tools for models without mcpActions', async () => {
    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        actions: ['list'],
        // No mcpActions defined
      },
    }

    const server = generateMcpServer(graphqlSchemaDeclaration, models)
    const [ct, st] = InMemoryTransport.createLinkedPair()
    await server.connect(st)

    const c = new Client({ name: 'test-client-2', version: '1.0.0' })
    await c.connect(ct)

    // When no tools are registered, the MCP server does not advertise
    // tool capabilities, so listTools() throws a "Method not found" error
    await expect(c.listTools()).rejects.toThrow()

    await c.close()
    await server.close()
  })
})
