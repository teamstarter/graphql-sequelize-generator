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
var _a = require('graphql'), GraphQLInputObjectType = _a.GraphQLInputObjectType, GraphQLObjectType = _a.GraphQLObjectType;
var attributeFields = require('graphql-sequelize').attributeFields;
var fields_1 = __importDefault(require("../associations/fields"));
/**
 * Returns a new `GraphQLObjectType` created from a sequelize model.
 *
 * It creates a `GraphQLObjectType` object with a name and fields. The
 * fields are generated from its sequelize associations.
 * @param {*} model The sequelize model used to create the `GraphQLObjectType`
 * @param {*} types Existing `GraphQLObjectType` types, created from all the Sequelize models
 */
function generateGraphQLType(model, types, isInput) {
    if (isInput === void 0) { isInput = false; }
    var GraphQLClass = isInput ? GraphQLInputObjectType : GraphQLObjectType;
    var type = new GraphQLClass({
        name: isInput ? model.name + "Input" : model.name,
        fields: function () { return (__assign(__assign({}, attributeFields(model, {
            allowNull: !!isInput,
            commentToDescription: true
        })), (isInput ? fields_1["default"](model.associations, types) : {}))); }
    });
    return type;
}
exports["default"] = generateGraphQLType;
