"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var graphQLType_1 = __importDefault(require("./graphQLType"));
/**
 * Returns a collection of `GraphQLObjectType` generated from Sequelize models.
 *
 * It creates an object whose properties are `GraphQLObjectType` created
 * from Sequelize models.
 * @param {*} models The sequelize models used to create the types
 */
// This function is exported
function generateModelTypes(models) {
    var outputTypes = {};
    var inputTypes = {};
    for (var modelName in models) {
        var model = models[modelName];
        // Only our models, not Sequelize nor sequelize
        if (Object.prototype.hasOwnProperty.call(model, 'name') &&
            modelName !== 'Sequelize') {
            outputTypes[modelName] = (0, graphQLType_1["default"])(model, outputTypes);
            inputTypes[modelName] = (0, graphQLType_1["default"])(model, inputTypes, true);
        }
    }
    return { outputTypes: outputTypes, inputTypes: inputTypes };
}
exports["default"] = generateModelTypes;
