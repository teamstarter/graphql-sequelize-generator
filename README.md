# Graphql-Sequelize-Generator

Graphql-Sequelize-Generator (GSG) is a set of tools that will allow you to
easily generate a GraphQL API from your sequelize models.

It's a very good fit for POCs and MVPs, while also scaling pretty well thanks to [dataloader-sequelize](https://github.com/mickhansen/dataloader-sequelize).

---

## Documentation

The complete documentation car be found [here](https://teamstarter.github.io/gsg-documentation/)

## What can I do with GSG?

The tools provided by this library will allow you to:

- Query any model defined in your app through GraphQL.
- Auto-generate create/update/delete mutations.
- Define before/after hooks and all resolvers, including the mutations.
- Easily create custom mutations.
- Get an integrated interface to test your GraphQL API.
- Counts for each model can also be generated.
- Subscriptions auto-generated for mutations.
- Webhooks fired on mutations.
- Serve several **audience-specific schemas** from one declaration (profiles).
- Add custom fields/resolvers on auto-generated types.
- Easy integration with [dataloader-sequelize](https://github.com/mickhansen/dataloader-sequelize)

---

## The schema declaration

Everything GSG does is driven by one object: the **schema declaration**. Its
keys become root fields; its values are either a *model declaration* (a
Sequelize model plus what may be done with it) or a plain
`GraphQLFieldConfig` for a custom endpoint.

```javascript
graphqlSchemaDeclaration.company = {
  model: models.company,
  actions: ['list', 'create', 'update', 'delete', 'count'],
  subscriptions: ['create', 'update'],
  webhooks: ['create', 'update', 'delete'],
  list: {
    beforeList: [({ findOptions, context }) => findOptions],
    afterList: [({ result }) => result],
  },
  additionalMutations: {
    companyArchive: { type, args, resolve },
  },
}
```

### Capability reference

Every row has a working example in `src/tests/testSchema.js`, which is the
fixture the test suite is built on — it is the fastest way to see a feature in
use.

| Capability | Declared as | Notes |
|---|---|---|
| Queries | `actions: ['list']` | See the caution below: presence in the declaration is what exposes the root query |
| Count | `actions: ['count']` | Adds `<model>Count` |
| Mutations | `actions: ['create', 'update', 'delete']` | Adds `<model>Create` / `<model>Update` / `<model>Delete` |
| Per-operation hooks | `list.beforeList`, `create.beforeCreate`, `update.beforeUpdateFetch`, `delete.afterDelete`, … | Single function or array |
| Global hook | `before` | Runs for every operation on the endpoint |
| Custom resolver | `list.resolver`, or `create.resolve` | Replaces the generated one |
| Custom endpoint | A `GraphQLFieldConfig` value instead of a model declaration | No `model`, no `actions` |
| Custom mutations | The `customMutations` argument | Top-level, not attached to a model |
| Endpoint-scoped mutations | `additionalMutations` | Attached to a model declaration |
| Subscriptions | `subscriptions: ['create', 'update']` | Requires a `pubSubInstance` |
| Webhooks | `webhooks: ['create', 'update']` | Requires a `callWebhook` |
| Hide a column | `excludeFields: ['secret']` | Output side |
| Association-only model | `excludeFromRoot: true` | Reachable by nesting, no root query |
| Cross-cutting hooks | `injectHooks({ graphqlSchemaDeclaration, injectFunctions })` | Inject the same hook into every endpoint — see `injectHooks.spec.js` |
| Audience-specific schemas | `profiles` | See below |

---

## Profiles: several schemas from one declaration

A declaration often needs to serve more than one audience — a browser session
and a machine-to-machine API token, say. Enforcing the difference at runtime
means the schema advertises more than the caller may actually run, and the
gap has to be documented by hand.

Profiles remove the gap. Each audience gets its own schema, containing exactly
what it may execute, generated from the same declaration.

```javascript
graphqlSchemaDeclaration.company = {
  model: models.company,
  actions: ['list', 'create', 'update', 'delete', 'count'],
  subscriptions: ['create', 'update'],
  profiles: {
    'read-only': { actions: ['list', 'count'] },
    'read-write': {
      actions: ['list', 'count', 'create', 'update'],
      subscriptions: ['update'],
    },
  },
}

const { filterDeclarationByProfile } = require('graphql-sequelize-generator')

const readOnlyDeclaration = filterDeclarationByProfile(
  graphqlSchemaDeclaration,
  'read-only'
)
```

**Everything is opt-in.** An endpoint with no `profiles` key is absent from
every profile's schema, so a newly added endpoint is private until somebody
says otherwise. Not every endpoint needs a profile — only those an audience
should reach.

Two shapes, two rules:

- **Named maps** — `additionalMutations`, `additionalSubscriptions` — hold
  entries, so each entry carries its own `profiles` key and declares its
  exposure where it is defined. `customMutations` works the same way, and
  filters through the same `filterDeclarationByProfile` call.
- **Event flags** — `actions`, `subscriptions`, `webhooks` — are named as a
  subset on the profile itself.

A profile may only narrow. Naming something the endpoint does not itself
declare throws at build time rather than silently exposing something
unreviewed.

`excludeFromRoot` may also be set per profile, to keep a model reachable
through an association while removing its root query for that audience.

### Profiles prune the type graph, not just the root

This is the property that makes a profile schema a boundary rather than a
filter. `injectAssociations` skips associations whose target model is absent
from the declaration, so dropping `companyType` from a profile also removes
`company { type { … } }`. There is no way to reach an excluded endpoint by
nesting.

Examples: `src/tests/profileSchema.spec.js` (schema shape) and
`src/tests/profileServer.spec.js` (served over HTTP).

---

## Cautions

Behaviours that are easy to get wrong and cost real debugging time.

**Presence in the declaration exposes the root list query — `actions` does
not.** `actions` gates count/create/update/delete. Listing a model at all adds
its root query, gated only by `excludeFromRoot`. To remove a read, drop the
entry or set `excludeFromRoot: true`; removing `'list'` from `actions` does
nothing.

**An empty mutation set must be absent, not empty.** GSG decides whether to
build a `Mutation` type with
`!!customMutations || …some(type => … || !!type.additionalMutations)`. Both
`customMutations: {}` and `additionalMutations: {}` are truthy, so either will
build an empty `Root_Mutations` and GraphQL will reject the schema with *"Type
Root_Mutations must define one or more fields"*. Pass no key at all.
`filterDeclarationByProfile` already removes maps it empties.

**One `types` object per schema.** `injectAssociations` mutates
`outputTypes[name]._fields` in place — a new type cannot be returned because
type names must be unique — and marks each type `associationsInjected`. Two
schemas therefore cannot share the result of one `generateModelTypes(models)`
call. Call it once per schema you build.

**Custom endpoints that call `injectAssociations` must be built after any
filtering.** That call walks the whole association graph and marks every type
it touches as injected. Done at module load with the full declaration, it
pre-injects everything, and a profile schema built later will skip those types
as already-injected — keeping associations it should have pruned. Build such
endpoints from the declaration actually being served. `oddUser` in
`src/tests/testSchema.js` shows the correct shape.

---

## Getting started

---

### Setting up the dependencies and the library

Add the lib and the peer dependencies of GraphQL-Sequelize-Generator:

```
yarn add graphql-sequelize-generator graphql sequelize graphql-sequelize @apollo/server dataloader-sequelize graphql-relay ws
```

⚠️ Caution: GSG requires Node v9.11.2 or greater as it is using async/await.

---

### Initializing the project with Sequelize-CLI and adding data to the database

If you need to initialize the project, please follow this Sequelize documentation page : [Sequelize-Cli and Migrations](https://sequelize.org/docs/v6/other-topics/migrations/)

---

# Setting up your server

Create a file where you will set up your server and paste the following code. We used index.js (at the root of our example project):

```javascript
// index.js
const { expressMiddleware } = require('@apollo/server/express4')
const express = require('express')
const http = require('http')
const cors = require('cors')
const json = require('body-parser')
const { createContext, EXPECTED_OPTIONS_KEY } = require('dataloader-sequelize')
const setupServer = require('./schema')
const models = require('./models') //Assuming "models" is your import of the Sequelize models folder, initialized by Sequelize-Cli

const createServer = async (options = {}, globalPreCallback = () => null) => {
  const app = express()
  options = {
    spdy: { plain: true },
    ...options,
  }
  const httpServer = http.createServer(options, app)
  const { server } = setupServer(globalPreCallback, httpServer)
  await server.start()
  //server.applyMiddleware({ app, path: '/graphql' })
  app.use(
    '/graphql',
    cors(),
    json(),
    expressMiddleware(server, {
      context: async ({ req, connection }) => {
        const contextDataloader = createContext(models.sequelize)

        // Connection is provided when a webSocket is connected.
        if (connection) {
          // check connection for metadata
          return {
            ...connection.context,
            [EXPECTED_OPTIONS_KEY]: contextDataloader,
          }
        }
      },
    })
  )

  await new Promise((resolve) => {
    httpServer.listen(process.env.PORT || 8080, () => {
      resolve()
    })

    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT || 8080}/graphql`
    )
  })
  return httpServer
}

const closeServer = async (server) => {
  await Promise.all([new Promise((resolve) => server.close(() => resolve()))])
}

createServer()
```

## Getting started with boilerplates

You can easily start a project with graphql-sequelize-generator using these boilerplates:

- In JavaScript : [GSG Boilerplate](https://github.com/teamstarter/gsg-boilerplate)
- In TypeScript : [GSG Typescript Boilerplate](https://github.com/teamstarter/gsg-boilerplate-typescript)
