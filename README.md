# Graphql-Sequelize-Generator

Graphql-Sequelize-Generator (GSG) is a set of tools that will allow you to
easily generate a GraphQL API from your sequelize models.

It's a very good fit for POCs and MVPs, while also scaling pretty well thanks to [dataloader-sequelize](https://github.com/mickhansen/dataloader-sequelize).

## What can I do with GSG?

The tools provided by this library will allow you to:

- Query any model defined in your app through GraphQL.
- Auto-generate create/update/delete mutations.
- Define before/after hooks and all resolvers, including the mutations.
- Easily create custom mutations.
- Get an integrated interface to test your GraphQL API.
- Counts for each model can also be generated.
- Subscriptions auto-generated for mutations.
- Add custom fields/resolvers on auto-generated types.
- Easy integration with [dataloader-sequelize](https://github.com/mickhansen/dataloader-sequelize)

## Getting started

Add the lib and the peer dependencies:

```
$ yarn add graphql-sequelize-generator graphql sequelize graphql-sequelize
```

⚠️ Caution: GSG requires at least Node v9.11.2 or greater as it is using async/await.

Then you will be ready to add a GraphQL API to your express server with only a few lines of code:

```javascript
const express = require('express')
const {
  generateModelTypes,
  generateGraphqlExpressMiddleware
} = require('graphql-sequelize-generator')
const models = require('./models')

const types = generateModelTypes(models)

graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ['list', 'create']
}

const server = generateApolloServer({
  graphqlSchemaDeclaration,
  types,
  models
})

const app = express()
server.applyMiddleware({
  app,
  path: '/graphql'
})
```

# Manual

Get started with [the online documentation](https://vincent-desmares.gitbook.io/graphql-sequelize-generator/)
