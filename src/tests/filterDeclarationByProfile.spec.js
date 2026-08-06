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

  describe('subscriptions and webhooks', () => {
    const withEvents = profile => ({
      company: {
        model: models.company,
        actions: ['list'],
        subscriptions: ['create', 'update', 'delete'],
        webhooks: ['create', 'update', 'delete'],
        profiles: { 'token-read': profile },
      },
    })

    it('keeps the subset the profile names', () => {
      const filtered = filterDeclarationByProfile(
        withEvents({
          actions: ['list'],
          subscriptions: ['create'],
          webhooks: ['create', 'update'],
        }),
        'token-read'
      )

      expect(filtered.company.subscriptions).toEqual(['create'])
      expect(filtered.company.webhooks).toEqual(['create', 'update'])
    })

    it('removes them entirely when the profile names none', () => {
      const filtered = filterDeclarationByProfile(
        withEvents({ actions: ['list'] }),
        'token-read'
      )

      expect(filtered.company.subscriptions).toBeUndefined()
      expect(filtered.company.webhooks).toBeUndefined()
    })

    it('throws when the profile names a subscription the endpoint does not', () => {
      const declaration = withEvents({ actions: ['list'] })
      declaration.company.subscriptions = ['create']
      declaration.company.profiles['token-read'].subscriptions = [
        'create',
        'delete',
      ]

      expect(() =>
        filterDeclarationByProfile(declaration, 'token-read')
      ).toThrow(/subscriptions.*delete/)
    })

    it('throws when the profile names a webhook the endpoint does not', () => {
      const declaration = withEvents({ actions: ['list'] })
      declaration.company.webhooks = ['create']
      declaration.company.profiles['token-read'].webhooks = ['create', 'update']

      expect(() =>
        filterDeclarationByProfile(declaration, 'token-read')
      ).toThrow(/webhooks.*update/)
    })
  })

  describe('additionalMutations and additionalSubscriptions', () => {
    // These are maps of named entries, so each entry declares its own
    // exposure — exactly as an endpoint does — rather than being listed on the
    // parent profile.
    const withNestedMaps = () => ({
      company: {
        model: models.company,
        actions: ['list'],
        additionalMutations: {
          companyArchive: {
            resolve: () => null,
            profiles: { 'token-read-write': {} },
          },
          companyPurge: {
            resolve: () => null,
          },
        },
        additionalSubscriptions: {
          companyChanged: {
            subscribe: () => null,
            profiles: { 'token-read-write': {} },
          },
          companyPurged: {
            subscribe: () => null,
          },
        },
        profiles: {
          'token-read': { actions: ['list'] },
          'token-read-write': { actions: ['list'] },
        },
      },
    })

    it('keeps only the nested entries that declare the profile', () => {
      const filtered = filterDeclarationByProfile(
        withNestedMaps(),
        'token-read-write'
      )

      expect(Object.keys(filtered.company.additionalMutations)).toEqual([
        'companyArchive',
      ])
      expect(Object.keys(filtered.company.additionalSubscriptions)).toEqual([
        'companyChanged',
      ])
    })

    it('strips the profiles key from surviving nested entries', () => {
      const filtered = filterDeclarationByProfile(
        withNestedMaps(),
        'token-read-write'
      )

      expect(
        filtered.company.additionalMutations.companyArchive.profiles
      ).toBeUndefined()
      expect(
        filtered.company.additionalMutations.companyArchive.resolve
      ).toBeDefined()
    })

    it('removes an emptied map entirely rather than leaving {}', () => {
      // generateSchema reads a present additionalMutations as proof that
      // mutations exist, so `{}` would build an invalid empty Root_Mutations.
      const filtered = filterDeclarationByProfile(
        withNestedMaps(),
        'token-read'
      )

      expect(
        'additionalMutations' in filtered.company
      ).toBe(false)
      expect(
        'additionalSubscriptions' in filtered.company
      ).toBe(false)
    })

    it('does not mutate the nested maps of the source', () => {
      const declaration = withNestedMaps()

      filterDeclarationByProfile(declaration, 'token-read-write')

      expect(Object.keys(declaration.company.additionalMutations)).toEqual([
        'companyArchive',
        'companyPurge',
      ])
      expect(
        declaration.company.additionalMutations.companyArchive.profiles
      ).toBeDefined()
    })
  })
})
