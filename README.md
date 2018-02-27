# Graphql Sequelize Generator

<!-- [START badges] -->

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Build Status](https://travis-ci.org/inovia-team/graphql-sequelize-generator.svg?branch=master)](https://travis-ci.org/inovia-team/graphql-sequelize-generator)

<!-- [END badges] -->

###### [API](docs/api.md) | [FAQ](#faq) | [Contributing](https://github.com/inovia-team/graphql-sequelize-generator/blob/master/CONTRIBUTING.md)

> Graphql-Sequelize-Generator (GSG) is a set of tools that will allow you to easily generate a [graphql](http://graphql.org/) API from your [sequelize](http://docs.sequelizejs.com/) models.

<!-- [START usecases] -->

###### What can I do?

The tools provided by this library will allow you to:

* [x] Query any model defined in your app through Graphql.
* [x] Auto-generate create/update/delete mutations.
* [x] Define before/after hooks and all resolvers, including the mutations.
* [x] Easily create custom mutations.
* [x] Get an integrated interface to test your Graphql API: Graphqli is available by default.
* [x] Counts for each model can also be generated
* [x] Subscriptions auto-generated for mutations
* [ ] Add custom fields/resolvers on auto-generated types
  <!-- [END usecases] -->

<!-- [START getstarted] -->

## Getting Started

### Installation

To use GSG in your project, run:

```
yarn add graphql-sequelize-generator
# or "npm i --save graphql-sequelize-generator"
```

### Usage

Caution: GSG requires at least Node v7.6.0 or greater as it is using async/await.

**Example** - adding a GraphQL API to my express:

```js
const models = require("./models");
const {
  generateModelTypes,
  generateGraphqlExpressMiddleware
} = require("./../index.js");

const modelTypes = generateModelTypes(models);

graphqlSchemaDeclaration.user = {
  model: models.user
};

app.use(
  "/graphql",
  generateGraphqlExpressMiddleware(graphqlSchemaDeclaration, modelTypes)
);
```

**Example** - Custom mutation.

```js
graphqlSchemaDeclaration.serverStatistics = {
  type: new GraphQLObjectType({
    name: "serverStatistics",
    description: "Statistics about the server",
    fields: {
      serverBootDate: { type: GraphQLString }
    }
  }),
  resolve: async (source, args, context, info) => {
    return {
      serverBootDate: context.bootDate
    };
  }
};
```

**Example** - Select only

```js
graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ["list"] // ['list', 'create', 'update', 'delete', 'count'] available
};
```

**Example queries** - Query associations

```graphql
{
  company(order: "reverse:name", limit: 50) {
    id
    name
    departments {
      id
      users {
        id
        name
      }
    }
  }
  serverStatistics {
    serverBootDate
  }
}
```

<!-- [END getstarted] -->

## API Documentation

Explore the [API documentation](docs/api.md) and [examples](https://github.com/inovia-team/graphql-sequelize-generator/tree/master/examples/) to learn more.

## Known limitations

One thing that makes this library possible is [dataloader sequelize](https://github.com/mickhansen/dataloader-sequelize). Those limitations are so inherited:

> Only plain requests are batched, meaning requests with includes and transactions are skipped. The batching does handle limit, and where but different limits and wheres are placed in different batches. Currently this module only leverages the batching functionality from dataloader, caching is disabled.

It will mostly impact you if you try to inject tables in the include property through the before hook.

For example when trying to limit the listing of companies:

Instead of that:

```js
list: {
    before: async (findOptions, args, context) => {
    if (typeof findOptions.include === 'undefined') {
        findOptions.include = []
    }
    findOptions.include.push({
        model: models.user,
        where: {
            id: context.myUserId
        }
    })
    return findOptions
},
```

Try to do this if possible:

```js
list: {
    before: async (findOptions, args, context) => {
    if (typeof findOptions.where === 'undefined') {
        findOptions.where = {}
    }
    findOptions.where = {
        $and: [
            findOptions.where,
            { id: context.myAllowedCompaniesIds }
        ]
    }
    return findOptions
    }
},
```

## Contributing to GSG

Check out [contributing guide](https://github.com/inovia-team/graphql-sequelize-generator/blob/master/CONTRIBUTING.md) to get an overview of open-source development at Matters.

###

Tests can be run with:

```bash
yarn test
```

A test server can be started with generated seeds with:

```bash
yarn start
```

It will make available a Graphiql interface at this [url](http://localhost:8080/graphql)

<!-- [START faq] -->

# FAQ

#### Q: Can I hide fields?

This is available through this configuration:.

@todo: Add an example

<!-- [END faq] -->
