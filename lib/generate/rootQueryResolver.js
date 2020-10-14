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
var graphql_1 = require("graphql");
var graphql_sequelize_1 = require("graphql-sequelize");
var countResolver_1 = __importDefault(require("./countResolver"));
var listResolver_1 = __importDefault(require("./listResolver"));
function getModelsFields(allSchemaDeclarations, outputTypes, models, globalPreCallback) {
    return Object.keys(outputTypes).reduce(function (fields, modelTypeName) {
        var _a, _b;
        var modelType = outputTypes[modelTypeName];
        var schemaDeclaration = allSchemaDeclarations[modelType.name];
        if (typeof schemaDeclaration === 'undefined') {
            // If a model is not defined, we just ignore it.
            return fields;
        }
        // One can exclude a given model from the root query.
        // It will only be used through associations.
        if (schemaDeclaration.excludeFromRoot === true) {
            return fields;
        }
        if (!schemaDeclaration.model) {
            throw new Error("You provided an empty/undefined model for the endpoint " + modelType + ". Please provide a Sequelize model.");
        }
        var result = schemaDeclaration.actions.indexOf('count') > -1
            ? __assign(__assign({}, fields), (_a = {}, _a[modelType.name] = listResolver_1["default"](modelType, allSchemaDeclarations, outputTypes, models, globalPreCallback), _a[modelType.name + "Count"] = {
                type: graphql_1.GraphQLInt,
                args: __assign(__assign({}, graphql_sequelize_1.defaultArgs(schemaDeclaration.model)), graphql_sequelize_1.defaultListArgs()),
                resolve: countResolver_1["default"](schemaDeclaration.model, schemaDeclaration, globalPreCallback)
            }, _a)) : __assign(__assign({}, fields), (_b = {}, _b[modelType.name] = listResolver_1["default"](modelType, allSchemaDeclarations, outputTypes, models, globalPreCallback), _b));
        return result;
    }, {});
}
function getCustomEndpoints(allSchemaDeclarations, outputTypes, models) {
    return Object.keys(allSchemaDeclarations).reduce(function (fields, endpointKey) {
        var _a;
        // We ignore all endpoints matching a model type.
        if (outputTypes[endpointKey]) {
            return fields;
        }
        var endpointDeclaration = allSchemaDeclarations[endpointKey];
        // @todo counts should only be added if configured in the schema declaration
        return __assign(__assign({}, fields), (_a = {}, _a[endpointKey] = endpointDeclaration, _a));
    }, {});
}
/**
 * Returns a root `GraphQLObjectType` used as query for `GraphQLSchema`.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the root `GraphQLSchema`
 */
function generateQueryRootResolver(allSchemaDeclarations, outputTypes, models, globalPreCallback) {
    // Endpoints depending on a model
    var modelFields = getModelsFields(allSchemaDeclarations, outputTypes, models, globalPreCallback);
    // Custom endpoints, without models specified.
    var customEndpoints = getCustomEndpoints(allSchemaDeclarations, outputTypes, models);
    var modelsKeys = Object.keys(modelFields);
    Object.keys(customEndpoints).filter(function (value) {
        if (modelsKeys.indexOf(value) !== -1) {
            throw new Error("You created the custom endpoint (" + value + ") on the same key of an already defined model endpoint.");
        }
    });
    return new graphql_1.GraphQLObjectType({
        name: 'Root_Query',
        fields: __assign(__assign({}, modelFields), customEndpoints)
    });
}
exports["default"] = generateQueryRootResolver;
