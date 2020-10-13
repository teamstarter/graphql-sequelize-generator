// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'GraphQLObj... Remove this comment to see the full error message
const { GraphQLObjectType } = require('graphql')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateMu... Remove this comment to see the full error message
const generateMutationCreate = require('./mutationCreateResolver')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateMu... Remove this comment to see the full error message
const generateMutationDelete = require('./mutationDeleteResolver')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateMu... Remove this comment to see the full error message
const generateMutationUpdate = require('./mutationUpdateResolver')

function wrapMutationsResolver(mutations: any, globalPreCallback: any) {
  const wrappedMutations = {}

  Object.keys(mutations).forEach(mutationKey => {
    const mutation = mutations[mutationKey]
    if (!mutation.resolve) {
      throw new Error(
        `A resolve attribute is required for custom mutations. Please provide one for [${mutationKey}]`
      )
    }
    // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
    wrappedMutations[mutationKey] = {
      ...mutation,
      resolve: async (source: any, args: any, context: any, info: any) => {
        const customHandle = globalPreCallback(`${mutationKey}CustomResolver`)
        const result = await mutation.resolve(source, args, context, info)
        if (customHandle) {
          customHandle()
        }
        return result
      }
    }
  })
  return wrappedMutations
}

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'generateMu... Remove this comment to see the full error message
const generateMutation = (
  graphqlSchemaDeclaration: any,
  inputTypes: any,
  outputTypes: any,
  models: any,
  globalPreCallback: any,
  customMutations = {},
  pubSubInstance = null
) => {
  const fields = Object.keys(inputTypes).reduce((mutations, modelName) => {
    const inputType = inputTypes[modelName]
    const outputType = outputTypes[modelName]
    if (!graphqlSchemaDeclaration[modelName]) {
      // If the model is not defined, we just ignore it
      return mutations
    }
    const model = graphqlSchemaDeclaration[modelName].model
    const actions = graphqlSchemaDeclaration[modelName].actions || [
      'create',
      'update',
      'delete'
    ]

    if (actions.includes('create')) {
      // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
      mutations[modelName + 'Create'] =
        graphqlSchemaDeclaration[modelName].create &&
        graphqlSchemaDeclaration[modelName].create.resolve
          ? graphqlSchemaDeclaration[modelName].create
          : generateMutationCreate(
              modelName,
              inputType,
              outputType,
              model,
              graphqlSchemaDeclaration[modelName],
              globalPreCallback,
              pubSubInstance
            )
    }
    if (actions.includes('update')) {
      // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
      mutations[modelName + 'Update'] =
        graphqlSchemaDeclaration[modelName].update &&
        graphqlSchemaDeclaration[modelName].update.resolve
          ? graphqlSchemaDeclaration[modelName].update
          : generateMutationUpdate(
              modelName,
              inputType,
              outputType,
              model,
              graphqlSchemaDeclaration[modelName],
              models,
              globalPreCallback,
              pubSubInstance
            )
    }
    if (actions.includes('delete')) {
      // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
      mutations[modelName + 'Delete'] =
        graphqlSchemaDeclaration[modelName].delete &&
        graphqlSchemaDeclaration[modelName].delete.resolve
          ? graphqlSchemaDeclaration[modelName].delete
          : generateMutationDelete(
              modelName,
              inputType,
              outputType,
              graphqlSchemaDeclaration[modelName],
              models,
              globalPreCallback,
              pubSubInstance
            )
    }

    if (graphqlSchemaDeclaration[modelName].additionalMutations) {
      Object.keys(graphqlSchemaDeclaration[modelName].additionalMutations).map(
        key =>
          // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
          (mutations[key] =
            graphqlSchemaDeclaration[modelName].additionalMutations[key])
      )
    }

    return mutations
  }, {})

  return new GraphQLObjectType({
    name: 'Root_Mutations',
    fields: {
      ...fields,
      ...wrapMutationsResolver(customMutations, globalPreCallback)
    }
  })
}

module.exports = generateMutation
