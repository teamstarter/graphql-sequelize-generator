"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.injectAssociations = exports.removeUnusedAttributes = exports.generateCount = exports.generateModelTypes = exports.generateSchema = exports.generateApolloServer = void 0;
var inject_1 = __importDefault(require("./associations/inject"));
exports.injectAssociations = inject_1["default"];
var generateApolloServer_1 = __importDefault(require("./generateApolloServer"));
exports.generateApolloServer = generateApolloServer_1["default"];
var removeUnusedAttributes_1 = __importDefault(require("./removeUnusedAttributes"));
exports.removeUnusedAttributes = removeUnusedAttributes_1["default"];
var schema_1 = __importDefault(require("./schema"));
exports.generateSchema = schema_1["default"];
var modelTypes_1 = __importDefault(require("./generateTypes/modelTypes"));
exports.generateModelTypes = modelTypes_1["default"];
var count_1 = __importDefault(require("./queryResolvers/count"));
exports.generateCount = count_1["default"];
