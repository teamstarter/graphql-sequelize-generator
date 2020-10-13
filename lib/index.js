"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.injectAssociations = exports.removeUnusedAttributes = exports.generateCount = exports.generateModelTypes = exports.generateSchema = exports.generateApolloServer = void 0;
var generate_1 = require("./generate");
exports.generateApolloServer = generate_1.generateApolloServer;
exports.generateSchema = generate_1.generateSchema;
exports.generateModelTypes = generate_1.generateModelTypes;
exports.injectAssociations = generate_1.injectAssociations;
exports.generateCount = generate_1.generateCount;
var removeUnusedAttributes_1 = __importDefault(require("./removeUnusedAttributes"));
exports.removeUnusedAttributes = removeUnusedAttributes_1["default"];
