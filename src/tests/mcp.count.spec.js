const { Client } = require('@modelcontextprotocol/sdk/client/index.js')
const {
  InMemoryTransport,
} = require('@modelcontextprotocol/sdk/inMemory.js')
const { generateMcpServer } = require('../../lib')
const { deleteTables } = require('./testDatabase.js')
const { resetDb } = require('./setupTestServer')
const models = require('./models')

describe('MCP count action', () => {
  let client
  let mcpServer

  beforeAll(async () => {
    await resetDb()

    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        mcpActions: ['count'],
      },
      location: {
        model: models.location,
        mcpActions: ['count'],
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

  it('should list count tools', async () => {
    const result = await client.listTools()
    const toolNames = result.tools.map((t) => t.name)
    expect(toolNames).toContain('user_count')
    expect(toolNames).toContain('location_count')
  })

  it('should count users', async () => {
    const result = await client.callTool({
      name: 'user_count',
      arguments: {},
    })

    expect(result.isError).toBeFalsy()
    const data = JSON.parse(result.content[0].text)
    expect(data).toHaveProperty('count')
    expect(typeof data.count).toBe('number')
    expect(data.count).toBeGreaterThan(0)
  })

  it('should count locations', async () => {
    const result = await client.callTool({
      name: 'location_count',
      arguments: {},
    })

    expect(result.isError).toBeFalsy()
    const data = JSON.parse(result.content[0].text)
    expect(data).toHaveProperty('count')
    expect(typeof data.count).toBe('number')
  })

  it('count should match list length', async () => {
    const allUsers = await models.user.findAll()
    const result = await client.callTool({
      name: 'user_count',
      arguments: {},
    })

    const data = JSON.parse(result.content[0].text)
    expect(data.count).toBe(allUsers.length)
  })
})
