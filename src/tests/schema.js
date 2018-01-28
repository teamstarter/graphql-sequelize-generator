const models = require('./models')
const graphqlHTTP = require('express-graphql')
const { generateModelTypes, generateSchema } = require('./../index.js')
const { GraphQLSchema } = require('graphql')

const graphqlSchemaDeclaration = {}
const modelTypes = generateModelTypes(models)

graphqlSchemaDeclaration.user = {
  model: models.user,
  actions: ['list', 'create'],
  list: {
    before: (findOptions, args, context, info) => {
      if (typeof findOptions.where === 'undefined') {
        findOptions.where = {}
      }
      findOptions.where = {
        $and: [findOptions.where, { departmentId: [1] }]
      }
      return findOptions
    }
  }
}

graphqlSchemaDeclaration.company = {
  model: models.company,
  actions: ['list', 'create'],
  list: {
    before: (findOptions, args, context, info) => {
      if (typeof findOptions.where === 'undefined') {
        findOptions.where = {}
      }
      findOptions.where = {
        $and: [findOptions.where, { id: [1] }]
      }
      return findOptions
    }
  }
}

graphqlSchemaDeclaration.department = {
  model: models.department,
  actions: ['list', 'create'],
  list: {
    before: (findOptions, args, context, info) => {
      findOptions.where = {
        id: [1, 2, 3, 4, 5, 6, 7, 8]
      }
      return findOptions
    }
  }
}

const schema = generateSchema(modelTypes, graphqlSchemaDeclaration)

const graphqlSchemaInstance = new GraphQLSchema(schema)

module.exports = {
  graphqlHttpServer: graphqlHTTP(req => ({
    schema: graphqlSchemaInstance,
    graphiql: true
  })),
  schema: graphqlSchemaInstance
}
