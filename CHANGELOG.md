# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="3.2.2"></a>
## [3.2.2](https://github.com/inovia-team/graphql-sequelize-generator/compare/v3.2.1...v3.2.2) (2019-07-19)


### Bug Fixes

* **security:** Upgrade some libraries. ([d8dd8b1](https://github.com/inovia-team/graphql-sequelize-generator/commit/d8dd8b1))



<a name="3.2.1"></a>
## [3.2.1](https://github.com/inovia-team/graphql-sequelize-generator/compare/v3.2.0...v3.2.1) (2019-07-19)


### Bug Fixes

* **security:** Upgrade jest for security reasons. ([4263164](https://github.com/inovia-team/graphql-sequelize-generator/commit/4263164))



<a name="3.2.0"></a>
# [3.2.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v3.1.0...v3.2.0) (2019-07-19)


### Features

* Allow to exclude attributes and associations. ([33152b9](https://github.com/inovia-team/graphql-sequelize-generator/commit/33152b9))



<a name="3.1.0"></a>
# [3.1.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v3.0.0...v3.1.0) (2019-07-08)


### Features

* **associations:** Allow to skip associations. ([e9fea8c](https://github.com/inovia-team/graphql-sequelize-generator/commit/e9fea8c))



<a name="3.0.0"></a>
# [3.0.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v2.0.0...v3.0.0) (2019-05-29)


### Features

* **mutations:** Add a way to declare mutations ouside of the models definitions. ([af5f36b](https://github.com/inovia-team/graphql-sequelize-generator/commit/af5f36b))


### BREAKING CHANGES

* **mutations:** Update of the generateApolloServer signature.



<a name="2.0.0"></a>
# [2.0.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v1.1.1...v2.0.0) (2019-05-25)


### Features

* Add a global callback, called before for each hooks. ([58ce66b](https://github.com/inovia-team/graphql-sequelize-generator/commit/58ce66b))


### BREAKING CHANGES

* generateSchema is now taking a configuration object instead of arguments.



<a name="1.1.1"></a>
## [1.1.1](https://github.com/inovia-team/graphql-sequelize-generator/compare/v1.1.0...v1.1.1) (2019-05-08)


### Bug Fixes

* Fix after hooks. Add more tests. ([ccd9737](https://github.com/inovia-team/graphql-sequelize-generator/commit/ccd9737))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v1.0.2...v1.1.0) (2019-05-08)


### Features

* Upgrade Sequelize. ([e7cbb60](https://github.com/inovia-team/graphql-sequelize-generator/commit/e7cbb60))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/inovia-team/graphql-sequelize-generator/compare/v1.0.1...v1.0.2) (2019-04-14)


### Bug Fixes

* **associations:** Fix associations not well injected. ([6ac30ce](https://github.com/inovia-team/graphql-sequelize-generator/commit/6ac30ce))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/inovia-team/graphql-sequelize-generator/compare/v1.0.0...v1.0.1) (2019-04-13)


### Bug Fixes

* **lib:** Expose the new function. ([aee38bc](https://github.com/inovia-team/graphql-sequelize-generator/commit/aee38bc))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v0.7.1...v1.0.0) (2019-04-13)


### Features

* **subscriptions:** Make generated subscriptions work. ([05e1393](https://github.com/inovia-team/graphql-sequelize-generator/commit/05e1393))


### BREAKING CHANGES

* **subscriptions:** Rename generateGraphqlExpressMiddleware to generateApolloServer.



<a name="0.7.1"></a>
## [0.7.1](https://github.com/inovia-team/graphql-sequelize-generator/compare/v0.7.0...v0.7.1) (2019-03-31)


### Bug Fixes

* **deps:** Move graphql-sequelize as a peer-dep to avoid types duplication. ([60fb914](https://github.com/inovia-team/graphql-sequelize-generator/commit/60fb914))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v0.6.0...v0.7.0) (2019-03-31)


### Features

* Expose and test the count resolver. ([4a50650](https://github.com/inovia-team/graphql-sequelize-generator/commit/4a50650))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v0.5.1...v0.6.0) (2019-03-31)


### Bug Fixes

* **doc:** Remove uselss command. ([ddbfc74](https://github.com/inovia-team/graphql-sequelize-generator/commit/ddbfc74))


### Features

* Add custom query endpoints. ([abd8e87](https://github.com/inovia-team/graphql-sequelize-generator/commit/abd8e87))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/inovia-team/graphql-sequelize-generator/compare/v0.5.0...v0.5.1) (2019-03-27)


### Bug Fixes

* **deps:** Move graphql as a peer-dep as the Types instances must come from the same source. ([2f2ece9](https://github.com/inovia-team/graphql-sequelize-generator/commit/2f2ece9))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v0.4.0...v0.5.0) (2019-03-27)


### Bug Fixes

* **deps:** Fix outdated dependency. ([1b7b724](https://github.com/inovia-team/graphql-sequelize-generator/commit/1b7b724))


### Features

* **seo:** Add tags for npm discovery. ([c1a12dd](https://github.com/inovia-team/graphql-sequelize-generator/commit/c1a12dd))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v0.3.0...v0.4.0) (2019-01-24)


### Bug Fixes

* **dependencies:** Make dataloader-sequelize a dep. ([b38f126](https://github.com/inovia-team/graphql-sequelize-generator/commit/b38f126))


### Features

* **doc:** Improve the README to reflect the last APIs changes. ([9939787](https://github.com/inovia-team/graphql-sequelize-generator/commit/9939787))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v0.2.1...v0.3.0) (2019-01-12)


### Features

* **dependencies:** Major upgrade of the library to fit the latest version of each main dependencies. ([9eaa6bf](https://github.com/inovia-team/graphql-sequelize-generator/commit/9eaa6bf))



<a name="0.2.1"></a>
## [0.2.1](https://github.com/inovia-team/graphql-sequelize-generator/compare/v0.2.0...v0.2.1) (2019-01-12)


### Bug Fixes

* Update dependencies. ([52421ca](https://github.com/inovia-team/graphql-sequelize-generator/commit/52421ca))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/inovia-team/graphql-sequelize-generator/compare/v0.1.0...v0.2.0) (2018-12-23)


### Features

* **API:** Expose more functions. ([e66e72a](https://github.com/inovia-team/graphql-sequelize-generator/commit/e66e72a))



<a name="0.1.0"></a>
# 0.1.0 (2018-12-23)


### Features

* **custom-endpoint:** Add a simple way to create new field by hand. ([cf42cdc](https://github.com/inovia-team/graphql-sequelize-generator/commit/cf42cdc))
