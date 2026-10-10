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
- Run a mutation and its hooks in **one transaction**, opt-in per declaration.
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
| Transactional mutations | `transactional: true`, `transactionOptions` | Per declaration, overridable per action — see Transactions below |

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

## Transactions

By default a generated mutation opens **no transaction**. The fetch, the hooks
and the write each run on their own, so a hook that writes another row is not
atomic with the row GSG writes: if the second write fails, the first stays.

### Enabling it

Set `transactional: true` on the declaration, and pass the `transaction` every
hook now receives to every query the hook runs. That is the whole API.

```javascript
graphqlSchemaDeclaration.notificationBatch = {
  model: models.notificationBatch,
  actions: ['create', 'update', 'delete'],
  transactional: true,
  update: {
    beforeUpdate: async ({ entity, args, transaction }) => {
      // Atomic with the update GSG is about to run: if either fails, neither
      // is kept.
      await models.notification.update(
        { status: 'cancelled' },
        { where: { batchId: entity.id }, transaction }
      )
      return args.notificationBatch
    },
  },
}
```

The flag can be set or overridden per action, and `transactionOptions` is
handed to `sequelize.transaction(...)` as is (an isolation level, typically):

```javascript
const { Transaction } = require('sequelize')

graphqlSchemaDeclaration.notificationBatch = {
  model: models.notificationBatch,
  actions: ['create', 'update', 'delete'],
  transactional: true,
  transactionOptions: {
    isolationLevel: Transaction.ISOLATION_LEVELS.SERIALIZABLE,
  },
  delete: {
    // Per-action override: delete keeps today's behaviour.
    transactional: false,
  },
}
```

A setting that cannot mean what it says throws **at schema build time**, not
at the first mutation: `transactional` that is not a boolean, or
`transactionOptions` on a declaration or an action that is not transactional.

### What a transactional mutation does

The resolver opens one transaction on `model.sequelize` and runs everything
in it, in this order:

1. the global `before` hooks;
2. `beforeUpdateFetch` / `beforeDeleteFetch` (update, delete);
3. the fetch of the entity (update, delete) or the `preventDuplicateOnAttributes`
   lookup (create);
4. `beforeCreate` / `beforeUpdate` / `beforeDelete`;
5. the write: `model.create`, `entity.update` + `entity.reload`, or
   `entity.destroy`;
6. `afterCreate` / `afterUpdate` / `afterDelete`.

Then it commits, and **only after the commit** publishes to `pubSubInstance`
and calls the webhook: a subscriber or a webhook never sees a row that then
rolls back. Any throw, from a hook or from Sequelize, rolls the transaction
back and is rethrown as is — the mutation returns the error, nothing is kept.

Hook call order and return values are the same as without a transaction: a
before hook still returns the attributes, the where or the entity for the
next step, and an after hook still returns the entity.

### The `transaction` hook parameter

Every mutation hook receives `transaction` in its params object: the open
Sequelize `Transaction` when the mutation is transactional, `undefined`
otherwise. Pass it to every query the hook runs — directly
(`{ transaction }`) or through the services the hook calls.

| Hook | Params |
|---|---|
| `before` (global) | `{ args, context, info, transaction }` — the queries (list, count) never pass one |
| `create.beforeCreate` | `{ source, args, context, info, transaction }` |
| `create.afterCreate` | `{ createdEntity, source, args, context, info, setWebhookData, transaction }` |
| `update.beforeUpdateFetch` | `{ source, args, context, info, transaction }` |
| `update.beforeUpdate` | `{ entity, source, args, context, info, transaction }` |
| `update.afterUpdate` | `{ updatedEntity, previousPropertiesSnapshot, source, args, context, info, transaction }` |
| `delete.beforeDeleteFetch` | `{ where, source, args, context, info, transaction }` |
| `delete.beforeDelete` | `{ entity, where, source, args, context, info, transaction }` |
| `delete.afterDelete` | `{ deletedEntity, source, args, context, info, transaction }` |

A hook written for a non-transactional declaration keeps working unchanged:
it simply receives `transaction: undefined`.

### Converting an existing declaration

`transactional` is opt-in because switching it on is only safe once every
hook on the declaration is transaction-aware. For one declaration:

1. **List every query the hooks run**, directly or through a service: every
   `models.x.findOne/findAll/create/update/destroy/count`, every
   `entity.save/update/destroy`, every `sequelize.query`, and every service
   call that does any of those. Include the global `before` hooks and any hook
   added through `injectHooks`.
2. **Pass the transaction to each one**: `{ transaction }` on the query
   options, or the transaction as an argument of the service. A service that
   opens its own transaction must instead accept a parent one and use it
   (with Sequelize, `sequelize.transaction({ transaction }, …)` opens a
   savepoint inside it; a helper that opens an independent transaction and
   retries must not be used inside the hook — see *No retries* below).
3. **Remove the workarounds** the hooks used to get atomicity without GSG:
   a hook that opened its own transaction, did the whole write in it, and
   returned `{ id }` so that GSG's own `entity.update` changed nothing; a
   `beforeDelete` that destroyed the row itself. Let GSG do the write.
4. **Move irreversible side effects** out of the hooks, or make them safe to
   lose. Inside a transactional mutation the after hooks run *before* the
   commit, so an email or an external API call made there has happened even
   if the commit then fails. Prefer a subscription or a webhook for them —
   GSG fires those after the commit — or keep them idempotent.
5. Set `transactional: true` and run the declaration's tests. A hook that
   still queries without the transaction will not fail loudly: it will read
   the row as it was before the update, or hang on a row the transaction
   locked (see *Cautions*). A test that updates the entity in a hook and
   reads it back in a later hook catches most of it.

Before, the workaround — a hook opening its own transaction and short-circuiting GSG's write:

```javascript
update: {
  beforeUpdate: async ({ entity, args }) => {
    await models.sequelize.transaction(async (transaction) => {
      await models.notification.update(
        { status: 'cancelled' },
        { where: { batchId: entity.id }, transaction }
      )
      await entity.update({ status: 'cancelled' }, { transaction })
    })
    // Returning only the id so that GSG's entity.update changes nothing.
    return { id: entity.id }
  },
}
```

After — GSG owns the transaction and the write:

```javascript
transactional: true,
update: {
  beforeUpdate: async ({ entity, args, transaction }) => {
    await models.notification.update(
      { status: 'cancelled' },
      { where: { batchId: entity.id }, transaction }
    )
    return args.notificationBatch
  },
},
```

### Cautions

**Opt-in is deliberate — do not flip it on a declaration whose hooks were
not converted.** Inside an open transaction, a query that does not pass
`transaction` goes through another connection: it sees the row as it was
before the update, or blocks on a row the transaction has locked until the
transaction ends — and the transaction is waiting on that very hook. Convert
the hooks first (above), then set the flag.

**Irreversible side effects run before the commit.** Emails, pushes, calls
to third parties made from a hook of a transactional mutation have happened
when the commit fails. Prefer subscriptions and webhooks, which GSG only
fires after the commit.

**No retries.** GSG never re-runs a transaction: a helper that re-runs a
callback on serialization failures would re-run every hook, and hooks send
emails and call APIs. Inside a transactional hook, call your service with the
`transaction` GSG gives you so that it joins the mutation's transaction — do
not wrap it in a helper that opens its own, which would commit separately and
defeat the point. When a serialization failure has to be retried, it is the
whole mutation that must be re-run, which only the caller can decide.

**Custom resolvers are not covered.** `transactional` only applies to the
mutations GSG generates. An action declared with its own `resolve`
(`create: { resolve }`) runs whatever that function does, hooks and
transaction included.

The behaviour is pinned by `src/tests/mutation.transactional.spec.js` in the
repository (not shipped in the npm package): the rollback, the shared
transaction, and that pubSub and the webhook wait for the commit.

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
