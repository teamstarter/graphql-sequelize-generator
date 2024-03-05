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
var server_1 = require("@apollo/server");
var disabled_1 = require("@apollo/server/plugin/disabled");
var graphql_1 = require("graphql");
var ws_1 = require("graphql-ws/lib/use/ws");
var schema_1 = __importDefault(require("./schema"));
function generateApolloServer(_a) {
    var graphqlSchemaDeclaration = _a.graphqlSchemaDeclaration, customMutations = _a.customMutations, types = _a.types, models = _a.models, _b = _a.apolloServerOptions, apolloServerOptions = _b === void 0 ? {} : _b, _c = _a.pubSubInstance, pubSubInstance = _c === void 0 ? null : _c, _d = _a.callWebhook, callWebhook = _d === void 0 ? function () { return null; } : _d, _e = _a.wsServer, wsServer = _e === void 0 ? null : _e, _f = _a.globalPreCallback, globalPreCallback = _f === void 0 ? function () { return null; } : _f, _g = _a.useServerOptions, useServerOptions = _g === void 0 ? {} : _g;
    var graphqlSchema = new graphql_1.GraphQLSchema((0, schema_1["default"])({
        graphqlSchemaDeclaration: graphqlSchemaDeclaration,
        customMutations: customMutations,
        types: types,
        models: models,
        globalPreCallback: globalPreCallback,
        pubSubInstance: pubSubInstance,
        callWebhook: callWebhook
    }));
    // Hand in the schema we just created and have the
    // WebSocketServer start listening.
    if (wsServer) {
        // @ts-ignore
        (0, ws_1.useServer)(__assign({ schema: graphqlSchema }, useServerOptions), wsServer);
    }
    return new server_1.ApolloServer(__assign({ schema: graphqlSchema, plugins: [(0, disabled_1.ApolloServerPluginCacheControlDisabled)()] }, apolloServerOptions));
}
exports["default"] = generateApolloServer;
