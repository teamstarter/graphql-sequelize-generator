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
var createResolver_1 = __importDefault(require("../createResolver"));
var inject_1 = __importDefault(require("../associations/inject"));
/**
 * Returns a root `GraphQLObjectType` used as query for `GraphQLSchema`.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the root `GraphQLSchema`
 */
function generateListResolver(modelType, allSchemaDeclarations, outputTypes, models, globalPreCallback) {
    var schemaDeclaration = allSchemaDeclarations[modelType.name];
    if (!schemaDeclaration.model) {
        throw new Error("You provided an empty/undefined model for the endpoint ".concat(modelType, ". Please provide a Sequelize model."));
    }
    return {
        type: new graphql_1.GraphQLList((0, inject_1["default"])(modelType, allSchemaDeclarations, outputTypes, models, globalPreCallback)),
        args: __assign(__assign(__assign({}, (0, graphql_sequelize_1.defaultArgs)(schemaDeclaration.model)), (0, graphql_sequelize_1.defaultListArgs)()), (schemaDeclaration.list && schemaDeclaration.list.extraArg
            ? schemaDeclaration.list.extraArg
            : {})),
        resolve: (0, createResolver_1["default"])(schemaDeclaration, models, globalPreCallback)
    };
}
exports["default"] = generateListResolver;
