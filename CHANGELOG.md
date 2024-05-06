# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [8.7.3](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.7.2...v8.7.3) (2024-05-06)


### Bug Fixes

* **delete:** Missing extra arg in type. ([7c49f37](https://github.com/teamstarter/graphql-sequelize-generator/commit/7c49f37))



### [8.7.2](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.7.1...v8.7.2) (2024-04-12)


### Bug Fixes

* **subscription:** Fix type declaration as list is not a mutation and has no subscriptions. ([fbc9f4d](https://github.com/teamstarter/graphql-sequelize-generator/commit/fbc9f4d))



### [8.7.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.7.0...v8.7.1) (2024-03-18)


### Bug Fixes

* **optimize:** Fix the limit/offset optimization not working with a table with multiple primary keys ([514fffb](https://github.com/teamstarter/graphql-sequelize-generator/commit/514fffb))



## [8.7.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.6.1...v8.7.0) (2024-03-08)


### Bug Fixes

* **list-resolver:** Fix a bug when an empty where is given to a resolver. Due to an implementation detail in graphql-sequelize we have to avoid optimizing in that case. Should not be a big deal as this should never be the case for n+1 queries. This time with the build. ([d304828](https://github.com/teamstarter/graphql-sequelize-generator/commit/d304828))


### Features

* **release:** Make sure the build is run before releasing. ([3f43265](https://github.com/teamstarter/graphql-sequelize-generator/commit/3f43265))



### [8.6.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.6.0...v8.6.1) (2024-03-08)


### Bug Fixes

* **list-resolver:** Fix a bug when an empty where is given to a resolver. Due to an implementation detail in graphql-sequelize we have to avoid optimizing in that case. Should not be a big deal as this should never be the case for n+1 queries. ([937c959](https://github.com/teamstarter/graphql-sequelize-generator/commit/937c959))



## [8.6.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.5.0...v8.6.0) (2024-03-08)


### Bug Fixes

* **build:** Update the build. ([b8b2c2a](https://github.com/teamstarter/graphql-sequelize-generator/commit/b8b2c2a))
* **types:** Fix resolver types not reflecting the fact that you can provide fields instead of declarations for each mutation. And cleanup a few warnings. ([bb16cb0](https://github.com/teamstarter/graphql-sequelize-generator/commit/bb16cb0))


### Features

* **dataloader:** Optimize all list calls by removing useless where and include properties to allow batching. Small clean on internal types. ([60fdde3](https://github.com/teamstarter/graphql-sequelize-generator/commit/60fdde3))
* **websockets:** add serverOption tu be able to use context operations while using web sockets ([#74](https://github.com/teamstarter/graphql-sequelize-generator/issues/74)) ([cc66160](https://github.com/teamstarter/graphql-sequelize-generator/commit/cc66160))



## [8.5.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.4.3...v8.5.0) (2024-03-04)


### Features

* **list:** Optimize limit/offset queries by pre-fetching the primary keys that should be returned. ([74c1959](https://github.com/teamstarter/graphql-sequelize-generator/commit/74c1959))



### [8.4.3](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.4.2...v8.4.3) (2024-03-01)


### Bug Fixes

* **hooks:** Fix update after entity not returned when no hooks were defined. ([077e365](https://github.com/teamstarter/graphql-sequelize-generator/commit/077e365))



### [8.4.2](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.4.1...v8.4.2) (2024-02-29)


### Bug Fixes

* **types:** Fix findOptions types ([e254092](https://github.com/teamstarter/graphql-sequelize-generator/commit/e254092))



### [8.4.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.4.0...v8.4.1) (2024-02-29)


### Bug Fixes

* **types:** Add webhook types missing from some hooks. Fix differences between the row and table class. ([3c0c9df](https://github.com/teamstarter/graphql-sequelize-generator/commit/3c0c9df))



## [8.4.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.3.2...v8.4.0) (2024-02-29)


### Features

* **types:** By types update in order to improve the signature pertinence of all the major functions and structures. ([c350fd5](https://github.com/teamstarter/graphql-sequelize-generator/commit/c350fd5))



### [8.3.2](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.3.1...v8.3.2) (2024-02-23)


### Bug Fixes

* **types:** Fix schema declartion types missing enforceMaxLimit and contextToOptions properties. ([39af964](https://github.com/teamstarter/graphql-sequelize-generator/commit/39af964))



### [8.3.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.3.0...v8.3.1) (2024-02-23)


### Bug Fixes

* **types:** Fix resolver types not reflecting the fact that you can provide fields instead of declarations for each mutation. And cleanup a few warnings. ([#84](https://github.com/teamstarter/graphql-sequelize-generator/issues/84)) ([629c157](https://github.com/teamstarter/graphql-sequelize-generator/commit/629c157)), closes [#74](https://github.com/teamstarter/graphql-sequelize-generator/issues/74) [#81](https://github.com/teamstarter/graphql-sequelize-generator/issues/81)



## [8.3.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.2.0...v8.3.0) (2023-10-10)


### Features

* **wsServer:** wsServer added + fix about about different type ([#82](https://github.com/teamstarter/graphql-sequelize-generator/issues/82)) ([e9fb384](https://github.com/teamstarter/graphql-sequelize-generator/commit/e9fb384)), closes [#74](https://github.com/teamstarter/graphql-sequelize-generator/issues/74) [#81](https://github.com/teamstarter/graphql-sequelize-generator/issues/81)



## [8.2.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.1.0...v8.2.0) (2023-06-29)


### Features

* **websockets:** add serverOption tu be able to use context operations while using web sockets  ([534f2d0](https://github.com/teamstarter/graphql-sequelize-generator/commit/534f2d0)), closes [#74](https://github.com/teamstarter/graphql-sequelize-generator/issues/74)



## [8.1.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v8.0.0...v8.1.0) (2023-03-08)


### Features

* **documentation:** Lead to the new documentation ([57f3221](https://github.com/teamstarter/graphql-sequelize-generator/commit/57f3221))



## [8.0.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.5.1...v8.0.0) (2023-01-31)


### Bug Fixes

* **associations:** Fix limit and offset type from string to int. And fix many small linting issues. ([04fc241](https://github.com/teamstarter/graphql-sequelize-generator/commit/04fc241))
* **documentation:** Update documentation to warn of Apollo upgrade. ([ab5c67d](https://github.com/teamstarter/graphql-sequelize-generator/commit/ab5c67d))


### Features

* **infra:** Upgrade minium node version. ([2d9ecf4](https://github.com/teamstarter/graphql-sequelize-generator/commit/2d9ecf4))


### BREAKING CHANGES

* **documentation:** Update documentation to warn of Apollo upgrade.



### [7.5.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.5.0...v7.5.1) (2022-01-20)

### Features

- **webhooks:** Make it easier to use graphql-web-hooks with GSG.

## [7.5.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.4.1...v7.5.0) (2021-10-19)

### Features

- **count:** Allow the count to have extra args. Use the ones from list if not specified. ([5ad2d81](https://github.com/teamstarter/graphql-sequelize-generator/commit/5ad2d81))
- **count-extra-arguments:** added the abbility to add an extra argum ([f128137](https://github.com/teamstarter/graphql-sequelize-generator/commit/f128137))
- **count-extra-arguments:** added the abbility to add an extra argument to the count query ([5c24eba](https://github.com/teamstarter/graphql-sequelize-generator/commit/5c24eba))

### [7.4.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.4.0...v7.4.1) (2021-09-21)

### Bug Fixes

- **parent-obejct-attributes:** Fix an issue with HasOne relations that failed to be fetched. ([ce28b57](https://github.com/teamstarter/graphql-sequelize-generator/commit/ce28b57))

## [7.4.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.3.5...v7.4.0) (2021-08-10)

### Features

- **workbench:** Add the models' comments in the workbench. ([29d768f](https://github.com/teamstarter/graphql-sequelize-generator/commit/29d768f))

### [7.3.5](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.3.4...v7.3.5) (2021-05-20)

### [7.3.4](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.3.3...v7.3.4) (2021-05-17)

### [7.3.3](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.3.2...v7.3.3) (2021-05-14)

### [7.3.2](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.3.1...v7.3.2) (2021-05-12)

### features

- **Hooks:** Add the preventDuplicateOnAttributes property on create to avoid duplicated automatically.

### [7.3.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.3.0...v7.3.1) (2020-11-04)

### Bug Fixes

- **typescript:** Add the missing Instance attribute on the models array. ([1ffd29a](https://github.com/teamstarter/graphql-sequelize-generator/commit/1ffd29a))

## [7.3.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.2.1...v7.3.0) (2020-11-04)

### Features

- **typescript:** Upgrade the types to reflect the real API. ([39cafe6](https://github.com/teamstarter/graphql-sequelize-generator/commit/39cafe6))

### [7.2.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.2.0...v7.2.1) (2020-11-03)

## [7.2.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.1.5...v7.2.0) (2020-10-22)

### Bug Fixes

- **CI:** Remove travis as we now use the Github actions. ([686b042](https://github.com/teamstarter/graphql-sequelize-generator/commit/686b042))
- **prettier:** prettier configuration for typescript ([6e35f2d](https://github.com/teamstarter/graphql-sequelize-generator/commit/6e35f2d))

### Features

- **before-hook-control:** The absence of the before hook is controlled and signaled for each resolver and each model ([9bd7b10](https://github.com/teamstarter/graphql-sequelize-generator/commit/9bd7b10))
- **ga-tests:** created the nodejs.yml file for github actions tests ([56ef757](https://github.com/teamstarter/graphql-sequelize-generator/commit/56ef757))

### [7.1.5](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.1.4...v7.1.5) (2020-10-15)

### Bug Fixes

- **typescript:** Fix root file type declaration. ([2adbb6e](https://github.com/teamstarter/graphql-sequelize-generator/commit/2adbb6e))

### [7.1.4](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.1.3...v7.1.4) (2020-10-15)

### Bug Fixes

- **typescript:** Fix type definition. ([1addc93](https://github.com/teamstarter/graphql-sequelize-generator/commit/1addc93))

### [7.1.3](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.1.2...v7.1.3) (2020-10-15)

### Bug Fixes

- **typescript:** Try to fix the typescript declaration. ([4c65e9a](https://github.com/teamstarter/graphql-sequelize-generator/commit/4c65e9a))

### [7.1.2](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.1.1...v7.1.2) (2020-10-15)

### Bug Fixes

- **typescript:** Reference the type file in the package. ([847e1da](https://github.com/teamstarter/graphql-sequelize-generator/commit/847e1da))

### [7.1.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.1.0...v7.1.1) (2020-10-15)

### Bug Fixes

- Fix main lib file still on old tree. ([f625bc7](https://github.com/teamstarter/graphql-sequelize-generator/commit/f625bc7))

## [7.1.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v7.0.0...v7.1.0) (2020-10-15)

### Bug Fixes

- **delete:** Add the missing extra args option on the delete resolver. ([53dc5a6](https://github.com/teamstarter/graphql-sequelize-generator/commit/53dc5a6))

### Features

- **API:** Move to Typescript ([498cffa](https://github.com/teamstarter/graphql-sequelize-generator/commit/498cffa))

## [7.0.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v6.1.0...v7.0.0) (2020-09-22)

- Allow schema without mutations (#18) ([1b0238b](https://github.com/teamstarter/graphql-sequelize-generator/commit/1b0238b)), closes [#18](https://github.com/teamstarter/graphql-sequelize-generator/issues/18) [#13](https://github.com/teamstarter/graphql-sequelize-generator/issues/13)

### BREAKING CHANGES

- Upgrade many libraries.

## [6.1.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v6.0.1...v6.1.0) (2020-07-24)

### Features

- **list:** Allow to enforce a max limit on list resolvers. ([25b23ad](https://github.com/teamstarter/graphql-sequelize-generator/commit/25b23ad))

### [6.0.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v6.0.0...v6.0.1) (2020-07-24)

## [6.0.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v5.6.0...v6.0.0) (2020-07-07)

### chore

- Upgrade dependencies. ([00da4b6](https://github.com/teamstarter/graphql-sequelize-generator/commit/00da4b6))

### BREAKING CHANGES

- Peer dependencies upgraded.

## [5.6.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v5.5.0...v5.6.0) (2020-05-25)

### Bug Fixes

- Add the global hook to the count resolver. ([b3e9acf](https://github.com/teamstarter/graphql-sequelize-generator/commit/b3e9acf))

### Features

- Add global hooks that works on all actions. ([af1bcf6](https://github.com/teamstarter/graphql-sequelize-generator/commit/af1bcf6))
- Disable subscriptions by default ([9407893](https://github.com/teamstarter/graphql-sequelize-generator/commit/9407893))

## [5.5.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v5.4.0...v5.5.0) (2020-05-11)

### Features

- Remove unused attributes now handles HasMany relationship. ([ba48972](https://github.com/teamstarter/graphql-sequelize-generator/commit/ba48972))

## [5.4.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v5.3.0...v5.4.0) (2020-04-21)

### Features

- **count:** Allow to use a custom resolver for the count endpoint. ([60afbc2](https://github.com/teamstarter/graphql-sequelize-generator/commit/60afbc2))

## [5.3.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v5.2.0...v5.3.0) (2020-04-21)

### Bug Fixes

- Fix removeUnusedAttributes when using a model referenced by the source. ([5b17b84](https://github.com/teamstarter/graphql-sequelize-generator/commit/5b17b84))
- Remove default export to avoid shadow dependency. ([f98e284](https://github.com/teamstarter/graphql-sequelize-generator/commit/f98e284))

### Features

- Improve the seeds. ([182ed8e](https://github.com/teamstarter/graphql-sequelize-generator/commit/182ed8e))
- One can specify a contextToOptions per resolver. ([6330304](https://github.com/teamstarter/graphql-sequelize-generator/commit/6330304))
- Update dataloader-sequelize example. ([38d4a6a](https://github.com/teamstarter/graphql-sequelize-generator/commit/38d4a6a))

## [5.2.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v5.1.0...v5.2.0) (2020-04-15)

### Features

- **performances:** Remove the unused attributes by default. ([a44d434](https://github.com/teamstarter/graphql-sequelize-generator/commit/a44d434))

## [5.1.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v5.0.2...v5.1.0) (2020-03-13)

### Features

- **project:** Add the afterList hook. ([045230d](https://github.com/teamstarter/graphql-sequelize-generator/commit/045230d))

### [5.0.2](https://github.com/teamstarter/graphql-sequelize-generator/compare/v5.0.1...v5.0.2) (2019-12-23)

### Bug Fixes

- **sorting:** Allow to sort on associations and secondary fields. ([288e7a1](https://github.com/teamstarter/graphql-sequelize-generator/commit/288e7a1))

### [5.0.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v5.0.0...v5.0.1) (2019-12-23)

### Bug Fixes

- **sorting:** Fix default sorting and improve sorting on virtual fields. ([f573772](https://github.com/teamstarter/graphql-sequelize-generator/commit/f573772))

## [5.0.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v4.0.0...v5.0.0) (2019-11-07)

### chore

- Update library deps. ([df3daa1](https://github.com/teamstarter/graphql-sequelize-generator/commit/df3daa1))

### BREAKING CHANGES

- Move graphql-sequelize as a peer-dependency.

## [4.0.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v3.4.0...v4.0.0) (2019-10-21)

### Bug Fixes

- **security:** Upgrade some dev libs to fix security issues. ([88e1ab8](https://github.com/teamstarter/graphql-sequelize-generator/commit/88e1ab8))

### chore

- Upgrade sequelize. ([35a1589](https://github.com/teamstarter/graphql-sequelize-generator/commit/35a1589))

### BREAKING CHANGES

- Move sequelize as a peer-dependency.

## [3.4.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v3.3.1...v3.4.0) (2019-09-05)

### Features

- Improve error handling for undefined models. ([5550369](https://github.com/teamstarter/graphql-sequelize-generator/commit/5550369))

### [3.3.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v3.3.0...v3.3.1) (2019-07-24)

### Bug Fixes

- Fix missing associations on models not defined on the server root. ([64f9f55](https://github.com/teamstarter/graphql-sequelize-generator/commit/64f9f55))

## [3.3.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v3.2.3...v3.3.0) (2019-07-24)

### Features

- You can exclude a model from the server root. ([24c9480](https://github.com/teamstarter/graphql-sequelize-generator/commit/24c9480))

### [3.2.3](https://github.com/teamstarter/graphql-sequelize-generator/compare/v3.2.2...v3.2.3) (2019-07-19)

### Bug Fixes

- **security:** Upgrade librairies. ([9517683](https://github.com/teamstarter/graphql-sequelize-generator/commit/9517683))

<a name="3.2.2"></a>

## [3.2.2](https://github.com/teamstarter/graphql-sequelize-generator/compare/v3.2.1...v3.2.2) (2019-07-19)

### Bug Fixes

- **security:** Upgrade some libraries. ([d8dd8b1](https://github.com/teamstarter/graphql-sequelize-generator/commit/d8dd8b1))

<a name="3.2.1"></a>

## [3.2.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v3.2.0...v3.2.1) (2019-07-19)

### Bug Fixes

- **security:** Upgrade jest for security reasons. ([4263164](https://github.com/teamstarter/graphql-sequelize-generator/commit/4263164))

<a name="3.2.0"></a>

# [3.2.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v3.1.0...v3.2.0) (2019-07-19)

### Features

- Allow to exclude attributes and associations. ([33152b9](https://github.com/teamstarter/graphql-sequelize-generator/commit/33152b9))

<a name="3.1.0"></a>

# [3.1.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v3.0.0...v3.1.0) (2019-07-08)

### Features

- **associations:** Allow to skip associations. ([e9fea8c](https://github.com/teamstarter/graphql-sequelize-generator/commit/e9fea8c))

<a name="3.0.0"></a>

# [3.0.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v2.0.0...v3.0.0) (2019-05-29)

### Features

- **mutations:** Add a way to declare mutations ouside of the models definitions. ([af5f36b](https://github.com/teamstarter/graphql-sequelize-generator/commit/af5f36b))

### BREAKING CHANGES

- **mutations:** Update of the generateApolloServer signature.

<a name="2.0.0"></a>

# [2.0.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v1.1.1...v2.0.0) (2019-05-25)

### Features

- Add a global callback, called before for each hooks. ([58ce66b](https://github.com/teamstarter/graphql-sequelize-generator/commit/58ce66b))

### BREAKING CHANGES

- generateSchema is now taking a configuration object instead of arguments.

<a name="1.1.1"></a>

## [1.1.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v1.1.0...v1.1.1) (2019-05-08)

### Bug Fixes

- Fix after hooks. Add more tests. ([ccd9737](https://github.com/teamstarter/graphql-sequelize-generator/commit/ccd9737))

<a name="1.1.0"></a>

# [1.1.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v1.0.2...v1.1.0) (2019-05-08)

### Features

- Upgrade Sequelize. ([e7cbb60](https://github.com/teamstarter/graphql-sequelize-generator/commit/e7cbb60))

<a name="1.0.2"></a>

## [1.0.2](https://github.com/teamstarter/graphql-sequelize-generator/compare/v1.0.1...v1.0.2) (2019-04-14)

### Bug Fixes

- **associations:** Fix associations not well injected. ([6ac30ce](https://github.com/teamstarter/graphql-sequelize-generator/commit/6ac30ce))

<a name="1.0.1"></a>

## [1.0.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v1.0.0...v1.0.1) (2019-04-13)

### Bug Fixes

- **lib:** Expose the new function. ([aee38bc](https://github.com/teamstarter/graphql-sequelize-generator/commit/aee38bc))

<a name="1.0.0"></a>

# [1.0.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v0.7.1...v1.0.0) (2019-04-13)

### Features

- **subscriptions:** Make generated subscriptions work. ([05e1393](https://github.com/teamstarter/graphql-sequelize-generator/commit/05e1393))

### BREAKING CHANGES

- **subscriptions:** Rename generateGraphqlExpressMiddleware to generateApolloServer.

<a name="0.7.1"></a>

## [0.7.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v0.7.0...v0.7.1) (2019-03-31)

### Bug Fixes

- **deps:** Move graphql-sequelize as a peer-dep to avoid types duplication. ([60fb914](https://github.com/teamstarter/graphql-sequelize-generator/commit/60fb914))

<a name="0.7.0"></a>

# [0.7.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v0.6.0...v0.7.0) (2019-03-31)

### Features

- Expose and test the count resolver. ([4a50650](https://github.com/teamstarter/graphql-sequelize-generator/commit/4a50650))

<a name="0.6.0"></a>

# [0.6.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v0.5.1...v0.6.0) (2019-03-31)

### Bug Fixes

- **doc:** Remove uselss command. ([ddbfc74](https://github.com/teamstarter/graphql-sequelize-generator/commit/ddbfc74))

### Features

- Add custom query endpoints. ([abd8e87](https://github.com/teamstarter/graphql-sequelize-generator/commit/abd8e87))

<a name="0.5.1"></a>

## [0.5.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v0.5.0...v0.5.1) (2019-03-27)

### Bug Fixes

- **deps:** Move graphql as a peer-dep as the Types instances must come from the same source. ([2f2ece9](https://github.com/teamstarter/graphql-sequelize-generator/commit/2f2ece9))

<a name="0.5.0"></a>

# [0.5.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v0.4.0...v0.5.0) (2019-03-27)

### Bug Fixes

- **deps:** Fix outdated dependency. ([1b7b724](https://github.com/teamstarter/graphql-sequelize-generator/commit/1b7b724))

### Features

- **seo:** Add tags for npm discovery. ([c1a12dd](https://github.com/teamstarter/graphql-sequelize-generator/commit/c1a12dd))

<a name="0.4.0"></a>

# [0.4.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v0.3.0...v0.4.0) (2019-01-24)

### Bug Fixes

- **dependencies:** Make dataloader-sequelize a dep. ([b38f126](https://github.com/teamstarter/graphql-sequelize-generator/commit/b38f126))

### Features

- **doc:** Improve the README to reflect the last APIs changes. ([9939787](https://github.com/teamstarter/graphql-sequelize-generator/commit/9939787))

<a name="0.3.0"></a>

# [0.3.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v0.2.1...v0.3.0) (2019-01-12)

### Features

- **dependencies:** Major upgrade of the library to fit the latest version of each main dependencies. ([9eaa6bf](https://github.com/teamstarter/graphql-sequelize-generator/commit/9eaa6bf))

<a name="0.2.1"></a>

## [0.2.1](https://github.com/teamstarter/graphql-sequelize-generator/compare/v0.2.0...v0.2.1) (2019-01-12)

### Bug Fixes

- Update dependencies. ([52421ca](https://github.com/teamstarter/graphql-sequelize-generator/commit/52421ca))

<a name="0.2.0"></a>

# [0.2.0](https://github.com/teamstarter/graphql-sequelize-generator/compare/v0.1.0...v0.2.0) (2018-12-23)

### Features

- **API:** Expose more functions. ([e66e72a](https://github.com/teamstarter/graphql-sequelize-generator/commit/e66e72a))

<a name="0.1.0"></a>

# 0.1.0 (2018-12-23)

### Features

- **custom-endpoint:** Add a simple way to create new field by hand. ([cf42cdc](https://github.com/teamstarter/graphql-sequelize-generator/commit/cf42cdc))
