import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  GraphqlSchemaDeclarationType,
  ModelDeclarationType,
  SequelizeModels,
} from './types/types'

type McpServerOptions = {
  serverInfo?: {
    name: string
    version: string
  }
}

/**
 * Converts a Sequelize attribute type key to a Zod schema.
 */
function sequelizeTypeToZod(typeKey: string, allowNull: boolean) {
  let schema
  switch (typeKey) {
    case 'INTEGER':
    case 'BIGINT':
    case 'FLOAT':
    case 'REAL':
    case 'DOUBLE':
    case 'DOUBLE PRECISION':
    case 'DECIMAL':
      schema = z.number()
      break
    case 'BOOLEAN':
      schema = z.boolean()
      break
    case 'DATE':
    case 'DATEONLY':
      schema = z.string()
      break
    case 'JSON':
    case 'JSONB':
      schema = z.any()
      break
    default:
      schema = z.string()
      break
  }
  if (allowNull) {
    schema = schema.optional()
  }
  return schema
}

/**
 * Builds a Zod shape from a Sequelize model's attributes.
 * If forInput is true, the 'id' field is excluded and all fields are optional.
 */
function buildZodShapeFromModel(
  model: any,
  options: { forInput?: boolean; excludeFields?: string[] } = {}
) {
  const attributes = model.getAttributes()
  const shape: Record<string, any> = {}
  const excludeFields = options.excludeFields || []

  for (const [name, attr] of Object.entries(attributes) as [string, any][]) {
    if (excludeFields.includes(name)) continue
    if (name === 'createdAt' || name === 'updatedAt') continue

    if (options.forInput && name === 'id') continue

    const typeKey = attr.type.key || attr.type.constructor.name
    const allowNull = options.forInput ? true : !!attr.allowNull
    shape[name] = sequelizeTypeToZod(typeKey, allowNull)
  }

  return shape
}

/**
 * Generates an McpServer from graphqlSchemaDeclaration and Sequelize models.
 *
 * Only models that have `mcpActions` defined will have MCP tools generated.
 * This is not enabled by default - you must explicitly set `mcpActions` on each model.
 */
export default function generateMcpServer(
  graphqlSchemaDeclaration: GraphqlSchemaDeclarationType,
  models: SequelizeModels,
  options: McpServerOptions = {}
): McpServer {
  const serverInfo = options.serverInfo || {
    name: 'gsg-mcp-server',
    version: '1.0.0',
  }

  const mcpServer = new McpServer(serverInfo)

  for (const modelName of Object.keys(graphqlSchemaDeclaration)) {
    const declaration = graphqlSchemaDeclaration[modelName]

    // Skip non-model declarations (custom GraphQL fields)
    if (!('model' in declaration)) continue

    const modelDeclaration = declaration as ModelDeclarationType<any>

    // Only generate MCP tools if mcpActions is explicitly defined
    if (!modelDeclaration.mcpActions || modelDeclaration.mcpActions.length === 0)
      continue

    const model = modelDeclaration.model
    const mcpActions = modelDeclaration.mcpActions
    const excludeFields = modelDeclaration.excludeFields || []

    if (mcpActions.includes('list')) {
      registerListTool(mcpServer, modelName, model, excludeFields)
    }

    if (mcpActions.includes('count')) {
      registerCountTool(mcpServer, modelName, model)
    }

    if (mcpActions.includes('create')) {
      registerCreateTool(mcpServer, modelName, model, excludeFields)
    }

    if (mcpActions.includes('update')) {
      registerUpdateTool(mcpServer, modelName, model, excludeFields)
    }

    if (mcpActions.includes('delete')) {
      registerDeleteTool(mcpServer, modelName, model)
    }
  }

  return mcpServer
}

function registerListTool(
  mcpServer: McpServer,
  modelName: string,
  model: any,
  excludeFields: string[]
) {
  mcpServer.tool(
    `${modelName}_list`,
    `List ${modelName} records`,
    {
      limit: z.number().optional(),
      offset: z.number().optional(),
      order: z.string().optional(),
    },
    async (args) => {
      const findOptions: any = {}

      if (args.limit !== undefined) findOptions.limit = args.limit
      if (args.offset !== undefined) findOptions.offset = args.offset
      if (args.order) {
        findOptions.order = [[args.order, 'ASC']]
      }

      if (excludeFields.length > 0) {
        const allAttributes = Object.keys(model.getAttributes())
        findOptions.attributes = allAttributes.filter(
          (a: string) => !excludeFields.includes(a)
        )
      }

      const results = await model.findAll(findOptions)

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              results.map((r: any) => r.get({ plain: true })),
              null,
              2
            ),
          },
        ],
      }
    }
  )
}

function registerCountTool(
  mcpServer: McpServer,
  modelName: string,
  model: any
) {
  mcpServer.tool(`${modelName}_count`, `Count ${modelName} records`, async () => {
    const count = await model.count()

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({ count }),
        },
      ],
    }
  })
}

function registerCreateTool(
  mcpServer: McpServer,
  modelName: string,
  model: any,
  excludeFields: string[]
) {
  const shape = buildZodShapeFromModel(model, {
    forInput: true,
    excludeFields,
  })

  mcpServer.tool(
    `${modelName}_create`,
    `Create a new ${modelName}`,
    shape,
    async (args: any) => {
      const entity = await model.create(args)

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(entity.get({ plain: true }), null, 2),
          },
        ],
      }
    }
  )
}

function registerUpdateTool(
  mcpServer: McpServer,
  modelName: string,
  model: any,
  excludeFields: string[]
) {
  const shape = buildZodShapeFromModel(model, {
    forInput: true,
    excludeFields,
  })
  // id is required for update
  shape.id = z.number()

  mcpServer.tool(
    `${modelName}_update`,
    `Update an existing ${modelName}`,
    shape,
    async (args: any) => {
      const entity = await model.findOne({ where: { id: args.id } })

      if (!entity) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: `${modelName} not found` }),
            },
          ],
          isError: true,
        }
      }

      const { id, ...updateData } = args
      await entity.update(updateData)
      await entity.reload()

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(entity.get({ plain: true }), null, 2),
          },
        ],
      }
    }
  )
}

function registerDeleteTool(
  mcpServer: McpServer,
  modelName: string,
  model: any
) {
  mcpServer.tool(
    `${modelName}_delete`,
    `Delete a ${modelName} by id`,
    {
      id: z.number(),
    },
    async (args) => {
      const entity = await model.findOne({ where: { id: args.id } })

      if (!entity) {
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify({ error: `${modelName} not found` }),
            },
          ],
          isError: true,
        }
      }

      await entity.destroy()

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ deleted: true, id: args.id }),
          },
        ],
      }
    }
  )
}
