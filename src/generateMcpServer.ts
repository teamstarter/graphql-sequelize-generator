import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  GlobalBeforeHook,
  GraphqlSchemaDeclarationType,
  ModelDeclarationType,
  SequelizeModels,
} from './types/types'

type McpServerOptions = {
  serverInfo?: {
    name: string
    version: string
  }
  /**
   * A function that returns the context object available to all before/after hooks.
   * Called once per tool invocation with the MCP extra metadata.
   * This mirrors GraphQL's context function.
   *
   * Example:
   *   context: (extra) => ({
   *     user: getUserFromSession(extra.sessionId),
   *     bootDate: Date.now(),
   *   })
   */
  context?: (extra: any) => any | Promise<any>
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
 * Runs the global before hooks from the model declaration.
 */
async function runGlobalBeforeHooks(
  modelDeclaration: ModelDeclarationType<any>,
  args: any,
  context: any
) {
  if (!modelDeclaration.before) return

  const beforeList: GlobalBeforeHook[] = Array.isArray(
    modelDeclaration.before
  )
    ? modelDeclaration.before
    : [modelDeclaration.before as GlobalBeforeHook]

  for (const before of beforeList) {
    await before({ args, context, info: {} })
  }
}

/**
 * Generates an McpServer from graphqlSchemaDeclaration and Sequelize models.
 *
 * Only models that have `mcpActions` defined will have MCP tools generated.
 * This is not enabled by default - you must explicitly set `mcpActions` on each model.
 *
 * The `context` option works like GraphQL's context: it receives the MCP extra
 * metadata (sessionId, etc.) and returns a context object passed to all hooks.
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
  const contextFn = options.context || (() => ({}))

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
      registerListTool(
        mcpServer,
        modelName,
        model,
        excludeFields,
        modelDeclaration,
        contextFn
      )
    }

    if (mcpActions.includes('count')) {
      registerCountTool(mcpServer, modelName, model, modelDeclaration, contextFn)
    }

    if (mcpActions.includes('create')) {
      registerCreateTool(
        mcpServer,
        modelName,
        model,
        excludeFields,
        modelDeclaration,
        contextFn
      )
    }

    if (mcpActions.includes('update')) {
      registerUpdateTool(
        mcpServer,
        modelName,
        model,
        excludeFields,
        modelDeclaration,
        contextFn
      )
    }

    if (mcpActions.includes('delete')) {
      registerDeleteTool(mcpServer, modelName, model, modelDeclaration, contextFn)
    }
  }

  return mcpServer
}

function registerListTool(
  mcpServer: McpServer,
  modelName: string,
  model: any,
  excludeFields: string[],
  modelDeclaration: ModelDeclarationType<any>,
  contextFn: (extra: any) => any
) {
  mcpServer.tool(
    `${modelName}_list`,
    `List ${modelName} records`,
    {
      limit: z.number().optional(),
      offset: z.number().optional(),
      order: z.string().optional(),
    },
    async (args, extra) => {
      const context = await contextFn(extra)
      await runGlobalBeforeHooks(modelDeclaration, args, context)

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

      // Run list before hooks
      if (
        modelDeclaration.list &&
        'before' in modelDeclaration.list &&
        modelDeclaration.list.before
      ) {
        const beforeList = Array.isArray(modelDeclaration.list.before)
          ? modelDeclaration.list.before
          : [modelDeclaration.list.before]

        for (const before of beforeList) {
          const result = await (before as Function)({
            findOptions,
            args,
            context,
            info: {},
          })
          if (result) {
            Object.assign(findOptions, result)
          }
        }
      }

      let results = await model.findAll(findOptions)

      // Run list after hooks
      if (
        modelDeclaration.list &&
        'after' in modelDeclaration.list &&
        modelDeclaration.list.after
      ) {
        const afterList = Array.isArray(modelDeclaration.list.after)
          ? modelDeclaration.list.after
          : [modelDeclaration.list.after]

        for (const after of afterList) {
          const result = await (after as Function)({
            result: results,
            args,
            context,
            info: {},
          })
          if (result) {
            results = result
          }
        }
      }

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify(
              results.map((r: any) =>
                typeof r.get === 'function' ? r.get({ plain: true }) : r
              ),
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
  model: any,
  modelDeclaration: ModelDeclarationType<any>,
  contextFn: (extra: any) => any
) {
  mcpServer.tool(
    `${modelName}_count`,
    `Count ${modelName} records`,
    async (extra) => {
      const context = await contextFn(extra)
      await runGlobalBeforeHooks(modelDeclaration, {}, context)

      const findOptions: any = {}

      // Run count before hooks
      const countDecl = modelDeclaration.count
      if (countDecl && 'before' in countDecl && countDecl.before) {
        const beforeList = Array.isArray(countDecl.before)
          ? countDecl.before
          : [countDecl.before]

        for (const before of beforeList) {
          const result = await (before as Function)({
            findOptions,
            args: {},
            context,
            info: {},
          })
          if (result) {
            Object.assign(findOptions, result)
          }
        }
      }

      const count = await model.count(findOptions)

      return {
        content: [
          {
            type: 'text' as const,
            text: JSON.stringify({ count }),
          },
        ],
      }
    }
  )
}

function registerCreateTool(
  mcpServer: McpServer,
  modelName: string,
  model: any,
  excludeFields: string[],
  modelDeclaration: ModelDeclarationType<any>,
  contextFn: (extra: any) => any
) {
  const shape = buildZodShapeFromModel(model, {
    forInput: true,
    excludeFields,
  })

  mcpServer.tool(
    `${modelName}_create`,
    `Create a new ${modelName}`,
    shape,
    async (args: any, extra) => {
      const context = await contextFn(extra)
      await runGlobalBeforeHooks(modelDeclaration, args, context)

      let attributes = { ...args }

      // Run create before hooks
      if (
        modelDeclaration.create &&
        'before' in modelDeclaration.create &&
        modelDeclaration.create.before
      ) {
        const beforeList = Array.isArray(modelDeclaration.create.before)
          ? modelDeclaration.create.before
          : [modelDeclaration.create.before]

        for (const before of beforeList) {
          const result = await (before as Function)({
            source: null,
            args: { [modelName]: attributes, ...args },
            context,
            info: {},
          })
          if (result) {
            attributes = result
          }
        }
      }

      const entity = await model.create(attributes)

      // Run create after hooks
      if (
        modelDeclaration.create &&
        'after' in modelDeclaration.create &&
        modelDeclaration.create.after
      ) {
        const afterList = Array.isArray(modelDeclaration.create.after)
          ? modelDeclaration.create.after
          : [modelDeclaration.create.after]

        let createdEntity = entity
        for (const after of afterList) {
          const result = await (after as Function)({
            createdEntity,
            source: null,
            args: { [modelName]: attributes, ...args },
            context,
            info: {},
          })
          if (result) {
            createdEntity = result
          }
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                createdEntity.get({ plain: true }),
                null,
                2
              ),
            },
          ],
        }
      }

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
  excludeFields: string[],
  modelDeclaration: ModelDeclarationType<any>,
  contextFn: (extra: any) => any
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
    async (args: any, extra) => {
      const context = await contextFn(extra)
      await runGlobalBeforeHooks(modelDeclaration, args, context)

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
      let attributes = updateData

      // Run update before hooks
      if (
        modelDeclaration.update &&
        'before' in modelDeclaration.update &&
        modelDeclaration.update.before
      ) {
        const beforeList = Array.isArray(modelDeclaration.update.before)
          ? modelDeclaration.update.before
          : [modelDeclaration.update.before]

        for (const before of beforeList) {
          const result = await (before as Function)({
            source: null,
            args: { [modelName]: attributes, id, ...args },
            context,
            info: {},
          })
          if (result) {
            attributes = result
          }
        }
      }

      const previousPropertiesSnapshot = { ...entity.get({ plain: true }) }
      await entity.update(attributes)
      await entity.reload()

      // Run update after hooks
      if (
        modelDeclaration.update &&
        'after' in modelDeclaration.update &&
        modelDeclaration.update.after
      ) {
        const afterList = Array.isArray(modelDeclaration.update.after)
          ? modelDeclaration.update.after
          : [modelDeclaration.update.after]

        let updatedEntity = entity
        for (const after of afterList) {
          const result = await (after as Function)({
            updatedEntity,
            previousPropertiesSnapshot,
            source: null,
            args: { [modelName]: attributes, id, ...args },
            context,
            info: {},
          })
          if (result) {
            updatedEntity = result
          }
        }

        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                updatedEntity.get({ plain: true }),
                null,
                2
              ),
            },
          ],
        }
      }

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
  model: any,
  modelDeclaration: ModelDeclarationType<any>,
  contextFn: (extra: any) => any
) {
  mcpServer.tool(
    `${modelName}_delete`,
    `Delete a ${modelName} by id`,
    {
      id: z.number(),
    },
    async (args, extra) => {
      const context = await contextFn(extra)
      await runGlobalBeforeHooks(modelDeclaration, args, context)

      let where: any = { id: args.id }

      // Run delete before hooks
      if (
        modelDeclaration.delete &&
        'before' in modelDeclaration.delete &&
        modelDeclaration.delete.before
      ) {
        const beforeList = Array.isArray(modelDeclaration.delete.before)
          ? modelDeclaration.delete.before
          : [modelDeclaration.delete.before]

        for (const before of beforeList) {
          const result = await (before as Function)({
            where,
            source: null,
            args,
            context,
            info: {},
          })
          if (result) {
            where = result
          }
        }
      }

      const entity = await model.findOne({ where })

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

      const snapshotBeforeDelete = { ...entity.get({ plain: true }) }
      await entity.destroy()

      // Run delete after hooks
      if (
        modelDeclaration.delete &&
        'after' in modelDeclaration.delete &&
        modelDeclaration.delete.after
      ) {
        const afterList = Array.isArray(modelDeclaration.delete.after)
          ? modelDeclaration.delete.after
          : [modelDeclaration.delete.after]

        for (const after of afterList) {
          await (after as Function)({
            deletedEntity: entity,
            source: null,
            args,
            context,
            info: {},
          })
        }
      }

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
