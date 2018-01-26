/**
 * Generates a update mutation operation
 *
 * @param {*} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} model
 */
module.exports = (
  modelName,
  inputType,
  outputType,
  model,
  graphqlModelDeclaration
) => ({
  type: outputType,
  description: 'Update a ' + modelName,
  args: {
    [modelName]: { type: inputType }
  },
  resolve: async (source, args, context, info) => {
    let data = args[modelName]
    if (
      graphqlModelDeclaration.update &&
      graphqlModelDeclaration.update.before
    ) {
      data = await graphqlModelDeclaration.update.before(
        source,
        args,
        context,
        info
      )
    }

    const object = await model.findOne({ where: { id: data.id } })

    if (!object) {
      throw new Error(`${modelName} not found.`)
    }

    await object.update(data)
    await object.reload()

    if (
      graphqlModelDeclaration.update &&
      graphqlModelDeclaration.update.after
    ) {
      return graphqlModelDeclaration.update.after(
        object,
        source,
        args,
        context,
        info
      )
    }
    return object
  }
})
