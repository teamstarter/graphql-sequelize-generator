# Graphql Sequelize Generator

<!-- [START badges] -->

[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Build Status](https://travis-ci.org/matterstech/graphql-sequelize-generator.svg?branch=master)](https://travis-ci.org/matterstech/graphql-sequelize-generator)
![](https://img.shields.io/npm/v/graphql-sequelize-generator.svg)

<!-- [END badges] -->

###### [API](docs/api.md) | [FAQ](#faq) | [Contributing](https://github.com/matterstech/graphql-sequelize-generator/blob/master/CONTRIBUTING.md)

> Graphql-Sequelize-Generator (GSG) is a set of tools that will allow you to easily generate a [graphql](http://graphql.org/) API from your [sequelize](http://docs.sequelizejs.com/) models.

<!-- [START usecases] -->

###### What can I do?

The tools provided by this library will allow you to:

- [x] Query any model defined in your app through Graphql.
- [x] Auto-generate create/update/delete mutations.
- [x] Define before/after hooks and all resolvers, including the mutations.
- [x] Easily create custom mutations.
- [x] Get an integrated interface to test your Graphql API: Graphqli is available by default.
- [x] Counts for each model can also be generated
- [x] Subscriptions auto-generated for mutations
- [ ] Add custom fields/resolvers on auto-generated types
  <!-- [END usecases] -->

![Generated API](https://github.com/matterstech/graphql-sequelize-generator/raw/master/assets/screen-graphql-playground.png)

<!-- [START getstarted] -->

## Getting Started

### Installation

To use GSG in your project, run:

```
yarn add graphql-sequelize-generator
# or "npm i --save graphql-sequelize-generator"
```

### Usage

Caution: GSG requires at least Node v9.11.2 or greater as it is using async/await.

**Example** - adding a GraphQL API to my express:

```js
const express = require("express");
const {
  generateModelTypes,
  generateGraphqlExpressMiddleware
} = require("graphql-sequelize-generator");
const models = require("./models");

const types = generateModelTypes(models);

graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ["list", "create"]
};

const server = generateApolloServer({
  graphqlSchemaDeclaration,
  types,
  models
});

const app = express();
server.applyMiddleware({
  app,
  path: "/graphql"
});
```

**Example** - Add a custom mutation related to a model.

```js
graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ["list", "create"],
  additionalMutations: {
    serverStatistics = {
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
    }
  }
}
```

**Example** - Select only configuration

```js
graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ["list"] // Other available options: ['list', 'create', 'update', 'delete', 'count']
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

**Example configuration** - All options:

```js
const server = generateApolloServer({
  graphqlSchemaDeclaration,
  types,
  models,
  customMutations: {
    /* ...
      your custom mutations that are not related to any declared models.
     ... */
  },
  // Apollo server options can be passed here.
  apolloServerOptions: {
    playground: true,
    context: addDataloaderContext,
    extensions: [
      () => new ApolloNewrelicExtension(),
      () => new ErrorTrackingExtension()
    ],
    tracing: true,
    // Example of socket security hook.
    subscriptions: {
      path: '/api/graphql',
      onConnect: async (connectionParams, webSocket) => {
        return getSubscriptionAccountAndUserFromJWT(connectionParams)
      }
    }
  },
  pubSubInstance
})
);
```

You can check the [test schema]([examples](https://github.com/matterstech/graphql-sequelize-generator/tree/master/src/tests/schema.js) which contains all of the feature available in the library.

<!-- [END getstarted] -->

## API Documentation

Explore the [API documentation](docs/api.md) and [examples](https://github.com/matterstech/graphql-sequelize-generator/tree/master/examples/) to learn more.

## Known limitations

One thing that makes this library possible is [dataloader sequelize](https://github.com/mickhansen/dataloader-sequelize). Those limitations are so inherited:

> Only plain requests are batched, meaning requests with includes and transactions are skipped. The batching does handle limit, and where but different limits and wheres are placed in different batches. Currently this module only leverages the batching functionality from dataloader, caching is disabled.

It will mostly impact you if you try to inject tables in the include property through the before hook.

For example when trying to limit the listing of companies:

Instead of that:

```js
list: {
  before: async (findOptions, args, context) => {
    if (typeof findOptions.include === "undefined") {
      findOptions.include = [];
    }
    findOptions.include.push({
      model: models.user,
      where: {
        id: context.myUserId
      }
    });
    return findOptions;
  };
}
```

Try to do this if possible:

```js
list: {
  before: async (findOptions, args, context) => {
    if (typeof findOptions.where === "undefined") {
      findOptions.where = {};
    }
    findOptions.where = {
      $and: [findOptions.where, { id: context.myAllowedCompaniesIds }]
    };
    return findOptions;
  };
}
```

## Contributing to GSG

Check out [contributing guide](https://github.com/matterstech/graphql-sequelize-generator/blob/master/CONTRIBUTING.md) to get an overview of open-source development at Matters.

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

You can use the property "excludeFields".

```js
graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ["list"],
  excludeFields: ["password", "preferences"] // Individual fields or generated models can be exluded.
};
```

<!-- [END faq] -->
