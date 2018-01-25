# Puppeteer 

<!-- [START badges] -->
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![Build Status](https://travis-ci.org/inovia-team/graphql-sequelize-generator.svg?branch=master)](https://travis-ci.org/inovia-team/graphql-sequelize-generator)
<!-- [END badges] -->

###### [API](docs/api.md) | [FAQ](#faq) | [Contributing](https://github.com/inovia-team/graphql-sequelize-generator/blob/master/CONTRIBUTING.md)

> Graphql-Sequelize-Generator (GSG) is a set of tools that will allow you to easily generate a [graphql](http://graphql.org/) API from your [sequelize](http://docs.sequelizejs.com/) models.

<!-- [START usecases] -->
###### What can I do?

The tools provided by this library will allow you to:

* Query any model defined in your app through Graphql.
* Auto-generate create/update/delete mutations.
* Define before/after hooks and all resolvers, including the mutations.
* Easily create custom mutations.
* Apply ACLs.
* Get an integrated interface to test your Graphql API: Graphqli is available by default.
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

**Example** - adding a graphql API to my express:

```js
const example1 = 'test';
```


**Example** - Custom mutation.

```js
const example2 = 'test';
```

**Example** - Apply ACLs

```js
const example2 = 'test';
```

<!-- [END getstarted] -->

## API Documentation

Explore the [API documentation](docs/api.md) and [examples](https://github.com/inovia-team/graphql-sequelize-generator/tree/master/examples/) to learn more.

## Contributing to GSG

Check out [contributing guide](https://github.com/inovia-team/graphql-sequelize-generator/blob/master/CONTRIBUTING.md) to get an overview of open-source development at Matters.

<!-- [START faq] -->

# FAQ

#### Q: Can I hide fields?

This is available through this configuration:.

@todo: Add an example


<!-- [END faq] -->