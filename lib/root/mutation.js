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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var graphql_1 = require("graphql");
var create_1 = __importDefault(require("../mutationResolvers/create"));
var delete_1 = __importDefault(require("../mutationResolvers/delete"));
var update_1 = __importDefault(require("../mutationResolvers/update"));
function wrapMutationsResolver(mutations, globalPreCallback) {
    var _this = this;
    var wrappedMutations = {};
    Object.keys(mutations).forEach(function (mutationKey) {
        var mutation = mutations[mutationKey];
        if (!mutation.resolve) {
            throw new Error("A resolve attribute is required for custom mutations. Please provide one for [" + mutationKey + "]");
        }
        wrappedMutations[mutationKey] = __assign(__assign({}, mutation), { resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
                var customHandle, result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            customHandle = globalPreCallback(mutationKey + "CustomResolver");
                            return [4 /*yield*/, mutation.resolve(source, args, context, info)];
                        case 1:
                            result = _a.sent();
                            if (customHandle) {
                                customHandle();
                            }
                            return [2 /*return*/, result];
                    }
                });
            }); } });
    });
    return wrappedMutations;
}
function generateMutation(graphqlSchemaDeclaration, inputTypes, outputTypes, models, globalPreCallback, customMutations, pubSubInstance, callWebhook) {
    if (customMutations === void 0) { customMutations = {}; }
    if (pubSubInstance === void 0) { pubSubInstance = null; }
    var fields = Object.keys(inputTypes).reduce(function (mutations, modelName) {
        var inputType = inputTypes[modelName];
        var outputType = outputTypes[modelName];
        if (!graphqlSchemaDeclaration[modelName]) {
            // If the model is not defined, we just ignore it
            return mutations;
        }
        var model = graphqlSchemaDeclaration[modelName].model;
        var actions = graphqlSchemaDeclaration[modelName].actions || [
            'create',
            'update',
            'delete'
        ];
        if (actions.includes('create')) {
            mutations[modelName + 'Create'] =
                graphqlSchemaDeclaration[modelName].create &&
                    graphqlSchemaDeclaration[modelName].create.resolve
                    ? graphqlSchemaDeclaration[modelName].create
                    : create_1["default"](modelName, inputType, outputType, model, graphqlSchemaDeclaration[modelName], globalPreCallback, pubSubInstance, callWebhook);
        }
        if (actions.includes('update')) {
            mutations[modelName + 'Update'] =
                graphqlSchemaDeclaration[modelName].update &&
                    graphqlSchemaDeclaration[modelName].update.resolve
                    ? graphqlSchemaDeclaration[modelName].update
                    : update_1["default"](modelName, inputType, outputType, graphqlSchemaDeclaration[modelName], models, globalPreCallback, pubSubInstance, callWebhook);
        }
        if (actions.includes('delete')) {
            mutations[modelName + 'Delete'] =
                graphqlSchemaDeclaration[modelName]["delete"] &&
                    graphqlSchemaDeclaration[modelName]["delete"].resolve
                    ? graphqlSchemaDeclaration[modelName]["delete"]
                    : delete_1["default"](modelName, graphqlSchemaDeclaration[modelName], models, globalPreCallback, pubSubInstance, callWebhook);
        }
        if (graphqlSchemaDeclaration[modelName].additionalMutations) {
            Object.keys(graphqlSchemaDeclaration[modelName].additionalMutations).map(function (key) {
                return (mutations[key] =
                    graphqlSchemaDeclaration[modelName].additionalMutations[key]);
            });
        }
        return mutations;
    }, {});
    return new graphql_1.GraphQLObjectType({
        name: 'Root_Mutations',
        fields: __assign(__assign({}, fields), wrapMutationsResolver(customMutations, globalPreCallback))
    });
}
exports["default"] = generateMutation;
