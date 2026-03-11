"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var field_1 = __importDefault(require("./field"));
/**
 * Returns the association fields of an entity.
 *
 * It iterates over all the associations and produces an object compatible with GraphQL-js.
 * BelongsToMany and HasMany associations are represented as a `GraphQLList` whereas a BelongTo
 * is simply an instance of a type.
 * @param {*} associations A collection of sequelize associations
 * @param {*} types Existing `GraphQLObjectType` types, created from all the Sequelize models
 */
function generateAssociationsFields(associations, types) {
    var fields = {};
    for (var associationName in associations) {
        fields[associationName] = (0, field_1["default"])(associations[associationName], types);
    }
    return fields;
}
exports["default"] = generateAssociationsFields;
