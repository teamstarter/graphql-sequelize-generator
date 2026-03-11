const { Client } = require('@modelcontextprotocol/sdk/client/index.js')
const {
  InMemoryTransport,
} = require('@modelcontextprotocol/sdk/inMemory.js')
const { generateMcpServer } = require('../../lib')
const { deleteTables } = require('./testDatabase.js')
const { resetDb } = require('./setupTestServer')
const models = require('./models')

describe('MCP update action', () => {
  let client
  let mcpServer

  beforeAll(async () => {
    await resetDb()

    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        mcpActions: ['update', 'list'],
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

  it('should list update tools', async () => {
    const result = await client.listTools()
    const toolNames = result.tools.map((t) => t.name)
    expect(toolNames).toContain('user_update')
  })

  it('should update an existing user', async () => {
    const result = await client.callTool({
      name: 'user_update',
      arguments: {
        id: 1,
        name: 'Updated MCP Name',
      },
    })

    expect(result.isError).toBeFalsy()
    const data = JSON.parse(result.content[0].text)
    expect(data.id).toBe(1)
    expect(data.name).toBe('Updated MCP Name')
  })

  it('should persist the update', async () => {
    await client.callTool({
      name: 'user_update',
      arguments: {
        id: 1,
        name: 'Persisted Update',
      },
    })

    const listResult = await client.callTool({
      name: 'user_list',
      arguments: {},
    })

    const allUsers = JSON.parse(listResult.content[0].text)
    const user = allUsers.find((u) => u.id === 1)
    expect(user.name).toBe('Persisted Update')
  })

  it('should return error for non-existent user', async () => {
    const result = await client.callTool({
      name: 'user_update',
      arguments: {
        id: 99999,
        name: 'Ghost',
      },
    })

    expect(result.isError).toBe(true)
    const data = JSON.parse(result.content[0].text)
    expect(data.error).toContain('not found')
  })

  it('should only update provided fields', async () => {
    const originalUser = await models.user.findByPk(1)
    const originalCompanyId = originalUser.companyId

    await client.callTool({
      name: 'user_update',
      arguments: {
        id: 1,
        name: 'Partial Update',
      },
    })

    const updatedUser = await models.user.findByPk(1)
    expect(updatedUser.name).toBe('Partial Update')
    expect(updatedUser.companyId).toBe(originalCompanyId)
  })
})
