const {
  GraphQLInt,
  GraphQLSchema,
  graphqlSync,
  getIntrospectionQuery,
} = require('graphql')

// Compiled output: this repo's jest has no TypeScript transform.
const {
  filterDeclarationByProfile,
  generateModelTypes,
  generateSchema,
} = require('../../lib')

const models = require('./models')

const declarationWithProfiles = () => ({
  company: {
    model: models.company,
    actions: ['list', 'create', 'update', 'delete', 'count'],
    additionalMutations: {
      companyArchive: {
        type: GraphQLInt,
        resolve: () => 1,
        // Declares its own exposure, so it reaches the read-write schema and
        // not the read-only one.
        profiles: { 'read-write': {} },
      },
      companyPurge: {
        type: GraphQLInt,
        resolve: () => 1,
        // No profile: must never reach any profile schema.
      },
    },
    profiles: {
      'read-only': { actions: ['list', 'count'] },
      'read-write': { actions: ['list', 'count', 'update'] },
      // Control for the pruning test: identical to read-only except that
      // `user` is in it too.
      'read-only-with-user': { actions: ['list', 'count'] },
    },
  },
  user: {
    model: models.user,
    actions: ['list', 'create', 'count'],
    // No 'read-only' profile: this is what must be pruned. Present in the
    // control profile so the pruning assertion cannot pass vacuously.
    profiles: {
      'read-only-with-user': { actions: ['list'] },
    },
  },
})

const schemaForProfile = profileName => {
  const types = generateModelTypes(models)

  return new GraphQLSchema(
    generateSchema({
      graphqlSchemaDeclaration: filterDeclarationByProfile(
        declarationWithProfiles(),
        profileName
      ),
      types,
      models,
    })
  )
}

const fieldNames = type => (type ? Object.keys(type.getFields()).sort() : null)

describe('A schema built from a profile', () => {
  it('exposes only the endpoints the profile declares', () => {
    const schema = schemaForProfile('read-only')

    expect(fieldNames(schema.getQueryType())).toEqual([
      'company',
      'companyCount',
    ])
  })

  it('keeps an association whose target IS in the profile', () => {
    // The control. Without this, the pruning assertion below would pass even if
    // `users` were absent for some reason having nothing to do with profiles.
    const schema = schemaForProfile('read-only-with-user')
    const company = schema.getType('company')

    expect(fieldNames(company)).toContain('users')
  })

  it('prunes associations whose target is not in the profile', () => {
    const schema = schemaForProfile('read-only')
    const company = schema.getType('company')

    expect(fieldNames(company)).not.toContain('users')
  })

  it('has no mutation type at all for a read-only profile', () => {
    const schema = schemaForProfile('read-only')

    expect(schema.getMutationType()).toBeUndefined()
  })

  it('exposes only the profile mutations for a read-write profile', () => {
    const schema = schemaForProfile('read-write')

    // companyArchive declares the profile and is present; companyPurge
    // declares none and is absent; companyCreate/companyDelete are absent
    // because the profile's actions do not name them.
    expect(fieldNames(schema.getMutationType())).toEqual([
      'companyArchive',
      'companyUpdate',
    ])
  })

  it('keeps a read-only profile free of mutations even when the endpoint has additionalMutations', () => {
    // The endpoint declares two additionalMutations. Neither names the
    // read-only profile, so the map is emptied — and must be removed rather
    // than left as {}, or generateSchema would build an empty Root_Mutations
    // and GraphQL would reject the schema outright.
    expect(schemaForProfile('read-only').getMutationType()).toBeUndefined()
  })

  it('is introspectable', () => {
    const schema = schemaForProfile('read-only')
    const result = graphqlSync({ schema, source: getIntrospectionQuery() })

    expect(result.errors).toBeUndefined()
  })
})
