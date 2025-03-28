const { injectHooks } = require('../../lib')
const { GraphQLError } = require('graphql')

describe('injectHooks', () => {
  it('should not overwrite custom update hooks', () => {
    // Create a custom update hook that throws an error
    const customUpdateHook = () => {
      throw new GraphQLError('Custom update hook should be called')
    }

    // Create a schema declaration with custom update hooks
    const schemaDeclaration = {
      user: {
        model: 'User',
        actions: ['update'],
        update: {
          before: [customUpdateHook],
          after: [customUpdateHook],
        },
      },
    }

    // Create inject functions that would normally add hooks
    const injectFunctions = {
      updateBefore: (model, existingHooks) => {
        return [...existingHooks, () => {}]
      },
      updateAfter: (model, existingHooks) => {
        return [...existingHooks, () => {}]
      },
    }

    // Inject hooks
    const result = injectHooks({
      graphqlSchemaDeclaration: schemaDeclaration,
      injectFunctions,
    })

    // Verify that the custom hooks are still present and in the correct order
    expect(result.user.update.before).toContain(customUpdateHook)
    expect(result.user.update.after).toContain(customUpdateHook)
    expect(result.user.update.before[0]).toBe(customUpdateHook)
    expect(result.user.update.after[0]).toBe(customUpdateHook)
  })

  it('should not inject hooks when custom resolve function is provided', () => {
    const customResolve = () => {
      return 'custom resolve result'
    }

    const schemaDeclaration = {
      user: {
        model: 'User',
        actions: ['update'],
        update: {
          resolve: customResolve,
        },
      },
    }

    const injectFunctions = {
      updateBefore: (model, existingHooks) => {
        return [...existingHooks, () => {}]
      },
      updateAfter: (model, existingHooks) => {
        return [...existingHooks, () => {}]
      },
    }

    const result = injectHooks({
      graphqlSchemaDeclaration: schemaDeclaration,
      injectFunctions,
    })

    // Verify that no hooks were injected
    expect(result.user.update.before).toBeUndefined()
    expect(result.user.update.after).toBeUndefined()
    expect(result.user.update.resolve).toBe(customResolve)
  })
})
