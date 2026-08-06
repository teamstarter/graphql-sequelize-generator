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
var inject_1 = __importDefault(require("./associations/inject"));
var mutation_1 = __importDefault(require("./root/mutation"));
var query_1 = __importDefault(require("./root/query"));
var subscriptions_1 = __importDefault(require("./root/subscriptions"));
var debug = (0, debug_1["default"])('gsg');
function generateSchema(_a) {
    var graphqlSchemaDeclaration = _a.graphqlSchemaDeclaration, types = _a.types, models = _a.models, customMutations = _a.customMutations, _b = _a.globalPreCallback, globalPreCallback = _b === void 0 ? function () { return null; } : _b, pubSubInstance = _a.pubSubInstance, callWebhook = _a.callWebhook;
    var mutationExists = !!customMutations ||
        Object.values(graphqlSchemaDeclaration).some(function (type) {
            if (type.actions) {
                return ['create', 'delete', 'update'].some(function (action) {
                    return type.actions.includes(action);
                });
            }
            return !!type.additionalMutations;
        });
    var definition = __assign({ query: (0, query_1["default"])(graphqlSchemaDeclaration, types.outputTypes, models, globalPreCallback) }, (mutationExists && {
        mutation: (0, mutation_1["default"])(graphqlSchemaDeclaration, types.inputTypes, types.outputTypes, models, globalPreCallback, customMutations, pubSubInstance, callWebhook)
    }));
    // Do not generate subscriptions if no ways of propagating information is defined.
    if (pubSubInstance) {
        definition.subscription = (0, subscriptions_1["default"])(graphqlSchemaDeclaration, types, pubSubInstance);
    }
    /**
     * Apply `excludeFields` to every declared model, including the ones nothing
     * else reaches.
     *
     * `excludeFields` is not a property of the output type — it is applied by
     * `injectAssociations`, and only two things call that: `queryResolvers/list`
     * for models with a root query, and `associations/field` for models some
     * other declared model points at. A model with `excludeFromRoot: true` that
     * is nobody's association target is reached by neither, so its type keeps
     * every raw column that `generateModelTypes` built from the model.
     *
     * That is invisible until such a type is referenced some other way — a
     * custom mutation's return type, a custom endpoint's type — and then it
     * appears unfiltered. It bites hardest with `filterDeclarationByProfile`,
     * where narrowing a declaration could leave a type LESS filtered than the
     * full schema had it.
     *
     * Running last means the two paths above have already done their work, so
     * this only catches what they could not, and existing schemas are unchanged.
     * The types are mutated in place and `new GraphQLSchema()` has not been
     * called yet, so the definition above picks this up.
     */
    Object.values(graphqlSchemaDeclaration).forEach(function (declaration) {
        var modelName = declaration && declaration.model && declaration.model.name;
        var outputType = modelName ? types.outputTypes[modelName] : null;
        if (!outputType || outputType.associationsInjected) {
            return;
        }
        (0, inject_1["default"])(outputType, graphqlSchemaDeclaration, types.outputTypes, models, globalPreCallback);
    });
    var resolverTab = ['list', 'create', 'update', 'delete', 'count'];
    Object.keys(graphqlSchemaDeclaration).forEach(function (key) {
        var schema = graphqlSchemaDeclaration[key];
        if (!schema.before) {
            resolverTab.forEach(function (resolverName) {
                var resolverBefore = schema[resolverName] && schema[resolverName].before
                    ? schema[resolverName].before
                    : undefined;
                if (!resolverBefore) {
                    debug("The ".concat(resolverName, " resolver of ").concat(key, " has no before hook. This may represent a security issue!"));
                }
            });
        }
    });
    return definition;
}
exports["default"] = generateSchema;
