"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.injectAssociations = exports.generateAssociationsFields = void 0;
var graphql_1 = require("graphql");
var graphql_sequelize_1 = require("graphql-sequelize");
var createResolver_1 = __importDefault(require("../createResolver"));
var debug_1 = __importDefault(require("debug"));
var debug = debug_1["default"]('gsg');
var generateAssociationField = function (relation, types, graphqlSchemaDeclaration, models, globalPreCallback, resolver) {
    if (resolver === void 0) { resolver = null; }
    var newBaseType = graphqlSchemaDeclaration &&
        !types[relation.target.name].associationsInjected
        ? exports.injectAssociations(types[relation.target.name], graphqlSchemaDeclaration, types, models, globalPreCallback)
        : types[relation.target.name];
    var type = relation.associationType === 'BelongsToMany' ||
        relation.associationType === 'HasMany'
        ? new graphql_1.GraphQLList(newBaseType)
        : newBaseType;
    var field = {
        type: type,
        isDeprecated: false,
        associationsInjected: true,
        name: relation.as,
        args: [
            {
                // An arg with the key order will automatically be converted to a order on the target
                name: 'order',
                type: graphql_1.GraphQLString
            }
        ]
    };
    if (relation.associationType === 'HasMany') {
        // Limit and offset will only work for HasMany relation ship
        // Having the limit on the include will trigger a "Only HasMany associations support include.separate" error.
        // While sequelize N:M associations are not supported with hasMany. So BelongsToMany relationships
        // cannot be limited in a subquery. If you want to query them, make a custom resolver, or create a view.
        field.args.push({ name: 'limit', type: graphql_1.GraphQLInt });
        field.args.push({ name: 'offset', type: graphql_1.GraphQLInt });
    }
    if (resolver) {
        // @ts-ignore
        field.resolve = resolver;
    }
    return field;
};
/**
 * Returns the association fields of an entity.
 *
 * It iterates over all the associations and produces an object compatible with GraphQL-js.
 * BelongsToMany and HasMany associations are represented as a `GraphQLList` whereas a BelongTo
 * is simply an instance of a type.
 * @param {*} associations A collection of sequelize associations
 * @param {*} types Existing `GraphQLObjectType` types, created from all the Sequelize models
 */
exports.generateAssociationsFields = function (associations, types) {
    var fields = {};
    for (var associationName in associations) {
        // @ts-expect-error ts-migrate(7053) FIXME: No index signature with a parameter of type 'strin... Remove this comment to see the full error message
        fields[associationName] = generateAssociationField(associations[associationName], types);
    }
    return fields;
};
exports.injectAssociations = function (modelGraphQLType, graphqlSchemaDeclaration, outputTypes, models, globalPreCallback, proxyModelName) {
    if (proxyModelName === void 0) { proxyModelName = null; }
    var modelName = proxyModelName || modelGraphQLType.name;
    if (Object.keys(modelName).length === 0) {
        throw new Error('Associations cannot be injected if no models were provided.');
    }
    outputTypes[modelName].associationsInjected = true;
    var associations = models[modelName].associations;
    if (Object.keys(associations).length === 0) {
        return modelGraphQLType;
    }
    var associationsFields = {};
    for (var associationName in associations) {
        if (!graphqlSchemaDeclaration[associations[associationName].target.name]) {
            debug("Cannot generate the association for model [" + associations[associationName].target.name + "] as it wasn't declared in the schema declaration. Skipping it.");
            continue;
        }
        associationsFields[associationName] = generateAssociationField(associations[associationName], outputTypes, graphqlSchemaDeclaration, models, globalPreCallback, createResolver_1["default"](graphqlSchemaDeclaration[associations[associationName].target.name], models, globalPreCallback, associations[associationName]));
    }
    // We have to mutate the original field, as type names must be unique
    // We cannot return a new type as the type may have already been used
    // In previous models.
    var baseFields = {};
    if (typeof graphqlSchemaDeclaration[modelName] !== 'undefined') {
        baseFields = graphql_sequelize_1.attributeFields(graphqlSchemaDeclaration[modelName].model, {
            allowNull: false,
            exclude: graphqlSchemaDeclaration[modelName].excludeFields
        });
    }
    // Fields can either be a function or an Object.
    // Due to the behavior of modelGraphQLType.toConfig(),
    // we must reconvert the fields to an Object to add more fields.
    // For more details, look at this file
    // node_modules/graphql/type/definition.js
    // As this will be calling the fields definition function,
    // make sure to not call injectAssociations in the middle of the fields definitions generation.
    // The model Types must already be generated.
    var defaultFields = modelGraphQLType.getFields();
    // The default fields needs to be filtered as attributeFields will
    // not contain the fields that are not defined in the models files.
    var fields = Object.keys(defaultFields).reduce(function (acc, field) {
        if (!graphqlSchemaDeclaration[modelName].excludeFields ||
            !graphqlSchemaDeclaration[modelName].excludeFields.includes(field)) {
            acc[field] = defaultFields[field];
        }
        return acc;
    }, {});
    for (var field in baseFields) {
        if (!graphqlSchemaDeclaration[modelName].excludeFields ||
            !graphqlSchemaDeclaration[modelName].excludeFields.includes(field)) {
            fields[field] = __assign({ name: field, isDeprecated: false, args: [] }, baseFields[field]);
        }
    }
    for (var field in associationsFields) {
        // One can also exclude generated field
        if (!graphqlSchemaDeclaration[modelName].excludeFields ||
            !graphqlSchemaDeclaration[modelName].excludeFields.includes(field)) {
            fields[field] = associationsFields[field];
        }
    }
    modelGraphQLType._fields = fields;
    return modelGraphQLType;
};
