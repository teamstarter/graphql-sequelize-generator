# Graphql-Sequelize-Generator

Graphql-Sequelize-Generator (GSG) is a set of tools that will allow you to
easily generate a GraphQL API from your sequelize models.

It's a very good fit for POCs and MVPs, while also scaling pretty well thanks to [dataloader-sequelize](https://github.com/mickhansen/dataloader-sequelize).

---

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

  await new Promise(resolve => {
    httpServer.listen(process.env.PORT || 8080, () => {
      resolve()
    })

    console.log(
      `🚀 Server ready at http://localhost:${process.env.PORT || 8080}/graphql`
    )
  })
  return httpServer
}

const closeServer = async server => {
  await Promise.all([new Promise(resolve => server.close(() => resolve()))])
}

createServer()
```

## Getting started with boilerplates

You can easily start a project with graphql-sequelize-generator using these boilerplates:

- In JavaScript : [GSG Boilerplate](https://github.com/teamstarter/gsg-boilerplate)
- In TypeScript : [GSG Typescript Boilerplate](https://github.com/teamstarter/gsg-boilerplate-typescript)
