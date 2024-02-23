import _debug from 'debug'
import { GraphQLObjectType } from 'graphql'
import { attributeFields } from 'graphql-sequelize'

import {
  GlobalPreCallback,
  GraphqlSchemaDeclarationType,
  ModelDeclarationType,
  OutputTypes,
  SequelizeModels,
} from '../../types'
import createResolver from '../createResolver'
import generateAssociationField from './field'

const debug = _debug('gsg')

export default function injectAssociations(
  modelGraphQLType: GraphQLObjectType,
  graphqlSchemaDeclaration: GraphqlSchemaDeclarationType,
  outputTypes: OutputTypes,
  models: SequelizeModels,
  globalPreCallback: GlobalPreCallback,
  proxyModelName: string | null = null
): GraphQLObjectType {
  const modelName = proxyModelName || modelGraphQLType.name
  if (Object.keys(modelName).length === 0) {
    throw new Error(
      'Associations cannot be injected if no models were provided.'
    )
  }
  // @ts-ignore
  outputTypes[modelName].associationsInjected = true

  const associations: any = models[modelName].associations
  if (Object.keys(associations).length === 0) {
    return modelGraphQLType
  }

  const associationsFields: any = {}
  for (const associationName in associations) {
    if (!graphqlSchemaDeclaration[associations[associationName].target.name]) {
      debug(
        `Cannot generate the association for model [${associations[associationName].target.name}] as it wasn't declared in the schema declaration. Skipping it.`
      )
      continue
    }
    associationsFields[associationName] = generateAssociationField(
      associations[associationName],
      outputTypes,
      graphqlSchemaDeclaration,
      models,
      globalPreCallback,
      createResolver(
        graphqlSchemaDeclaration[
          associations[associationName].target.name
          // Models MUST be ModelDeclarationType. GraphQLFieldConfig are for custom endpoints.
        ] as ModelDeclarationType,
        models,
        globalPreCallback,
        associations[associationName]
      )
    )
  }

  // We have to mutate the original field, as type names must be unique
  // We cannot return a new type as the type may have already been used
  // In previous models.
  let baseFields: any = {}
  const modelDefinition = graphqlSchemaDeclaration[
    modelName
  ] as ModelDeclarationType

  if (typeof modelDefinition !== 'undefined') {
    baseFields = attributeFields(modelDefinition.model, {
      allowNull: false,
      exclude: modelDefinition.excludeFields,
      commentToDescription: true,
    })
  }

  // Fields can either be a function or an Object.
  // Due to the behavior of modelGraphQLType.toConfig(),
  // we must reconvert the fields to an Object to add more fields.

  // For more details, look at this file
  // node_modules/graphql/type/definition.js

  // As this will be calling the fields definition function,
  // make sure to not call injectAssociations in the middle of the fields definitions generation.
  // The model Types must already be generated.
  const defaultFields = modelGraphQLType.getFields()
  // This is a hack as typscript cannot check it properly when in the if statement.
  const excludedFields = modelDefinition.excludeFields || []

  // The default fields needs to be filtered as attributeFields will
  // not contain the fields that are not defined in the models files.
  const fields = Object.keys(defaultFields).reduce(
    (acc: any, field: string) => {
      if (!excludedFields.includes(field)) {
        acc[field] = defaultFields[field]
      }
      return acc
    },
    {}
  )

  for (const field in baseFields) {
    if (!excludedFields.includes(field)) {
      fields[field] = {
        name: field,
        isDeprecated: false,
        args: [],
        ...baseFields[field],
      }
    }
  }

  for (const field in associationsFields) {
    // One can also exclude generated field

    if (!excludedFields.includes(field)) {
      fields[field] = associationsFields[field]
    }
  }

  // Due to the lack of API on the Graphql object we have to overwrite a private field
  // as this action is not needed by the users of the lib, we just "Hide it under the rug".
  // @ts-ignore
  modelGraphQLType._fields = fields

  return modelGraphQLType
}
