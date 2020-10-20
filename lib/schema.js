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
var debug_1 = __importDefault(require("debug"));
var query_1 = __importDefault(require("./root/query"));
var subscriptions_1 = __importDefault(require("./root/subscriptions"));
var mutation_1 = __importDefault(require("./root/mutation"));
var debug = debug_1["default"]('gsg');
function generateSchema(_a) {
    var graphqlSchemaDeclaration = _a.graphqlSchemaDeclaration, types = _a.types, models = _a.models, customMutations = _a.customMutations, _b = _a.globalPreCallback, globalPreCallback = _b === void 0 ? function () { return null; } : _b, pubSubInstance = _a.pubSubInstance;
    var mutationExists = !!customMutations ||
        Object.values(graphqlSchemaDeclaration).some(function (type) {
            if (type.actions) {
                return ['create', 'delete', 'update'].some(function (action) {
                    return type.actions.includes(action);
                });
            }
            return !!type.additionalMutations;
        });
    var definition = __assign({ query: query_1["default"](graphqlSchemaDeclaration, types.outputTypes, models, globalPreCallback) }, (mutationExists && {
        mutation: mutation_1["default"](graphqlSchemaDeclaration, types.inputTypes, types.outputTypes, models, globalPreCallback, customMutations, pubSubInstance)
    }));
    // Do not generate subscriptions if no ways of propagating information is defined.
    if (pubSubInstance) {
        definition.subscription = subscriptions_1["default"](graphqlSchemaDeclaration, types, pubSubInstance);
    }
    var resolverTab = [
        'list',
        'create',
        'update',
        'delete',
        'count'
    ];
    Object.keys(graphqlSchemaDeclaration).forEach(function (key) {
        var schema = graphqlSchemaDeclaration[key];
        if (!schema.before) {
            resolverTab.forEach(function (resolverName) {
                var resolverBefore = schema[resolverName] &&
                    schema[resolverName].before
                    ? schema[resolverName].before
                    : undefined;
                if (!resolverBefore) {
                    debug("The " + resolverName + " resolver of " + key + " has no before hook. This may represent a security issue !");
                }
            });
        }
    });
    return definition;
}
exports["default"] = generateSchema;
