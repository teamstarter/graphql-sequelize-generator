const { Client } = require('@modelcontextprotocol/sdk/client/index.js')
const {
  InMemoryTransport,
} = require('@modelcontextprotocol/sdk/inMemory.js')
const { generateMcpServer } = require('../../lib')
const { deleteTables } = require('./testDatabase.js')
const { resetDb } = require('./setupTestServer')
const models = require('./models')

describe('MCP delete action', () => {
  let client
  let mcpServer

  beforeAll(async () => {
    await resetDb()

    const graphqlSchemaDeclaration = {
      user: {
        model: models.user,
        mcpActions: ['delete', 'list', 'count'],
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

  it('should list delete tools', async () => {
    const result = await client.listTools()
    const toolNames = result.tools.map((t) => t.name)
    expect(toolNames).toContain('user_delete')
  })

  it('should delete an existing user', async () => {
    const countBefore = await models.user.count()

    const result = await client.callTool({
      name: 'user_delete',
      arguments: { id: 1 },
    })

    expect(result.isError).toBeFalsy()
    const data = JSON.parse(result.content[0].text)
    expect(data.deleted).toBe(true)
    expect(data.id).toBe(1)

    const countAfter = await models.user.count()
    expect(countAfter).toBe(countBefore - 1)
  })

  it('should return error for non-existent user', async () => {
    const result = await client.callTool({
      name: 'user_delete',
      arguments: { id: 99999 },
    })

    expect(result.isError).toBe(true)
    const data = JSON.parse(result.content[0].text)
    expect(data.error).toContain('not found')
  })

  it('should no longer find deleted user in list', async () => {
    await client.callTool({
      name: 'user_delete',
      arguments: { id: 1 },
    })

    const listResult = await client.callTool({
      name: 'user_list',
      arguments: {},
    })

    const allUsers = JSON.parse(listResult.content[0].text)
    const found = allUsers.find((u) => u.id === 1)
    expect(found).toBeUndefined()
  })

  it('should reflect deletion in count', async () => {
    const countBefore = await models.user.count()

    // Find an actual user to delete
    const existingUser = await models.user.findOne()
    expect(existingUser).not.toBeNull()

    await client.callTool({
      name: 'user_delete',
      arguments: { id: existingUser.id },
    })

    const countAfter = await models.user.count()
    expect(countAfter).toBe(countBefore - 1)
  })
})
