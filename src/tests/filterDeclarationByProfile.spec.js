// Tests run against the compiled output: this repo's jest has no TypeScript
// transform, so `yarn build` must precede `yarn test`.
const { filterDeclarationByProfile } = require('../../lib')

const models = require('./models')

const aDeclaration = () => ({
  company: {
    model: models.company,
    actions: ['list', 'create', 'update', 'delete', 'count'],
    profiles: {
      'token-read': { actions: ['list', 'count'] },
      'token-read-write': { actions: ['list', 'count', 'update'] },
    },
  },
  user: {
    model: models.user,
    actions: ['list', 'count'],
    profiles: {
      'token-read': { actions: ['list'], excludeFromRoot: true },
    },
  },
  // No profiles at all: must never appear in a filtered declaration.
  session: {
    model: models.session,
    actions: ['list', 'create'],
  },
})

describe('filterDeclarationByProfile', () => {
  it('drops every endpoint that does not declare the profile', () => {
    const filtered = filterDeclarationByProfile(aDeclaration(), 'token-read')

    expect(Object.keys(filtered).sort()).toEqual(['company', 'user'])
  })

  it('replaces actions with the profile actions', () => {
    const filtered = filterDeclarationByProfile(aDeclaration(), 'token-read')

    expect(filtered.company.actions).toEqual(['list', 'count'])
  })

  it('gives a different profile a different set of actions', () => {
    const filtered = filterDeclarationByProfile(
      aDeclaration(),
      'token-read-write'
    )

    expect(Object.keys(filtered)).toEqual(['company'])
    expect(filtered.company.actions).toEqual(['list', 'count', 'update'])
  })

  it('carries excludeFromRoot from the profile', () => {
    const filtered = filterDeclarationByProfile(aDeclaration(), 'token-read')

    expect(filtered.user.excludeFromRoot).toBe(true)
    expect(filtered.company.excludeFromRoot).toBeUndefined()
  })

  it('strips the profiles key from the result', () => {
    const filtered = filterDeclarationByProfile(aDeclaration(), 'token-read')

    expect(filtered.company.profiles).toBeUndefined()
  })

  it('throws when a profile declares an action the endpoint does not', () => {
    const declaration = aDeclaration()
    declaration.user.profiles['token-read'].actions = ['list', 'delete']

    expect(() => filterDeclarationByProfile(declaration, 'token-read')).toThrow(
      /user.*delete/
    )
  })

  it('does not mutate the source declaration', () => {
    const declaration = aDeclaration()
    const before = JSON.stringify(Object.keys(declaration))
    const companyActionsBefore = [...declaration.company.actions]

    filterDeclarationByProfile(declaration, 'token-read')

    expect(JSON.stringify(Object.keys(declaration))).toEqual(before)
    expect(declaration.company.actions).toEqual(companyActionsBefore)
    expect(declaration.company.profiles).toBeDefined()
  })

  it('keeps custom endpoints that declare the profile, without actions', () => {
    const declaration = {
      customThing: {
        type: 'whatever',
        resolve: () => null,
        profiles: { 'token-read': {} },
      },
    }

    const filtered = filterDeclarationByProfile(declaration, 'token-read')

    expect(filtered.customThing.resolve).toBeDefined()
    expect(filtered.customThing.profiles).toBeUndefined()
  })

  it('drops additionalMutations, subscriptions and webhooks', () => {
    const declaration = {
      company: {
        model: models.company,
        actions: ['list'],
        additionalMutations: { doThing: {} },
        subscriptions: ['create'],
        webhooks: ['create'],
        profiles: { 'token-read': { actions: ['list'] } },
      },
    }

    const filtered = filterDeclarationByProfile(declaration, 'token-read')

    expect(filtered.company.additionalMutations).toBeUndefined()
    expect(filtered.company.subscriptions).toBeUndefined()
    expect(filtered.company.webhooks).toBeUndefined()
  })
})
