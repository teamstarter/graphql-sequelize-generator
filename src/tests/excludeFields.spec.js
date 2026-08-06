const { GraphQLSchema } = require('graphql')

// Compiled output: this repo's jest has no TypeScript transform.
const { generateModelTypes, generateSchema } = require('../../lib')

const models = require('./models')

/**
 * `excludeFields` is applied by injectAssociations, which used to return early
 * for a model with no associations — skipping the field rebuild along with the
 * association loop. The option was therefore silently ignored for every
 * association-less model, on any schema, profiles or not.
 *
 * It is the option that hides columns like a password hash, so ignoring it
 * fails open. `log` has no associations in the test models, which is what makes
 * it the subject here.
 */
describe('excludeFields on a model with no associations', () => {
  const logFieldsFor = declaration => {
    const types = generateModelTypes(models)

    const schema = new GraphQLSchema(
      generateSchema({ graphqlSchemaDeclaration: declaration, types, models })
    )

    return Object.keys(schema.getType('log').getFields())
  }

  it('is applied for a model queryable at the root', () => {
    const fields = logFieldsFor({
      log: { model: models.log, actions: ['list'], excludeFields: ['message'] },
    })

    expect(fields).not.toContain('message')
  })

  it('leaves the other fields alone', () => {
    // The control: the assertion above is about `message`, not about the type
    // coming back empty.
    const fields = logFieldsFor({
      log: { model: models.log, actions: ['list'], excludeFields: ['message'] },
    })

    expect(fields).toContain('id')
  })

  it('keeps the field when nothing excludes it', () => {
    const fields = logFieldsFor({
      log: { model: models.log, actions: ['list'] },
    })

    expect(fields).toContain('message')
  })
})
