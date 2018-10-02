const { GraphQLObjectType } = require('graphql')

const generateMutationCreate = require('./mutationCreateResolver')
const generateMutationDelete = require('./mutationDeleteResolver')
const generateMutationUpdate = require('./mutationUpdateResolver')

const generateMutation = (
  graphqlSchemaDeclaration,
  inputTypes,
  outputTypes,
  models
) => {
  const fields = Object.keys(inputTypes).reduce((mutations, modelName) => {
    const inputType = inputTypes[modelName]
    const outputType = outputTypes[modelName]
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
            graphqlSchemaDeclaration[modelName]
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
            models
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
            models
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
    fields
  })
}

module.exports = generateMutation
