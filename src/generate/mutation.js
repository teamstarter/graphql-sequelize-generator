const { GraphQLObjectType } = require('graphql')

const generateMutationCreate = require('./mutationCreateResolver')
const generateMutationDelete = require('./mutationDeleteResolver')
const generateMutationUpdate = require('./mutationUpdateResolver')

function wrapMutationsResolver (mutations, globalPreCallback) {
  const wrappedMutations = {}

  Object.keys(mutations).forEach(mutationKey => {
    const mutation = mutations[mutationKey]
    if (!mutation.resolve) {
      throw new Error(
        `A resolve attribute is required for custom mutations. Please provide one for [${mutationKey}]`
      )
    }
    wrappedMutations[mutationKey] = {
      ...mutation,
      resolve: async (source, args, context, info) => {
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

const generateMutation = (
  graphqlSchemaDeclaration,
  inputTypes,
  outputTypes,
  models,
  globalPreCallback,
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
