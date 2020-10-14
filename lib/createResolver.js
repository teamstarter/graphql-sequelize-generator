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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var graphql_sequelize_1 = require("graphql-sequelize");
var removeUnusedAttributes_1 = __importDefault(require("./removeUnusedAttributes"));
function allowOrderOnAssociations(findOptions, model) {
    if (typeof findOptions.order === 'undefined') {
        return findOptions;
    }
    var processedOrder = [];
    var checkForAssociationSort = function (singleOrder, index) {
        // When the comas is used, graphql-sequelize will not handle the 'reverse:' command.
        // We have to implement it ourselves.
        var field = null;
        // By default we take the direction detected by GraphQL-sequelize
        // It will be 'ASC' if 'reverse:' was not specified.
        // But this will only work for the first field.
        var direction = index === 0 ? findOptions.order[0][1] : 'ASC';
        // When reverse is not already removed by graphql-sequelize
        // we try to detect it ourselves. Happens for multiple fields sort.
        if (singleOrder.search('reverse:') === 0) {
            field = singleOrder.slice(8).trim();
            direction = 'DESC';
        }
        else {
            field = singleOrder.trim();
        }
        // if there is exactly one dot, we check for associations
        var parts = field.split('.');
        if (parts.length === 2) {
            var associationName = parts[0];
            if (typeof model.associations[associationName] === 'undefined') {
                throw new Error("Association " + associationName + " unknown on model " + model.name + " order");
            }
            if (typeof findOptions.include === 'undefined') {
                findOptions.include = [];
            }
            var modelInclude = {
                model: model.associations[associationName].target
            };
            if (model.associations[associationName].as) {
                modelInclude.as = model.associations[associationName].as;
            }
            findOptions.include.push(modelInclude);
            var modelSort = {
                model: model.associations[associationName].target
            };
            // When sorting by a associated table, the alias must be specified
            // if defined in the association definition.
            if (model.associations[associationName].as) {
                modelSort.as = model.associations[associationName].as;
            }
            processedOrder.push([modelSort, parts[1], direction]);
        }
        else {
            // Virtual field must be sorted using quotes
            // as they are not real fields.
            if (model.rawAttributes[field] &&
                model.rawAttributes[field].type.key === 'VIRTUAL') {
                // When a virtual field is used, we must sort with the expression and not
                // the name of the field, as it is not compatible with multiple database engines.
                // IE : Sorting by virtual field is inefficient if using sub-queries.
                field = model.rawAttributes[field].type.fields[0][0];
            }
            processedOrder.push([field, direction]);
        }
    };
    /**
     * The sorting in sequelize can be represented in multiple forms:
     * order = ['id', 'DESC']
     * order = [['id', 'DESC'], ['fullname', 'ASC']]
     * order = [[models.user, 'id', 'DESC']]
     *
     * This part tries to add a multiple-sort feature to what is already
     * parsed by graphql-sequelize.
     *
     * order = ['id,reverse:fullname', 'ASC']
     * to
     * order = [['id', 'ASC'], ['fullname', 'DESC']
     */
    findOptions.order.map(function (order) {
        // Handle multiple sort fields.
        if (order[0].search(',') === -1) {
            checkForAssociationSort(order[0], 0);
            return;
        }
        var multipleOrder = order[0].split(',');
        for (var index in multipleOrder) {
            checkForAssociationSort(multipleOrder[index], parseInt(index));
        }
    });
    findOptions.order = processedOrder;
    return findOptions;
}
var argsAdvancedProcessing = function (findOptions, args, context, info, model, models) {
    findOptions = allowOrderOnAssociations(findOptions, model);
    // When an association uses a scope, we have to add it to the where condition by default.
    if (info.parentType &&
        models[info.parentType.name] &&
        models[info.parentType.name].associations[info.fieldName].scope) {
        findOptions.where = __assign(__assign({}, (findOptions.where ? findOptions.where : {})), models[info.parentType.name].associations[info.fieldName].scope);
    }
    return findOptions;
};
function createResolver(graphqlTypeDeclaration, models, globalPreCallback, relation) {
    var _this = this;
    if (relation === void 0) { relation = null; }
    if (graphqlTypeDeclaration &&
        graphqlTypeDeclaration.list &&
        graphqlTypeDeclaration.list.resolver) {
        return function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
            var customResolverHandle, customResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        customResolverHandle = globalPreCallback('customListBefore');
                        return [4 /*yield*/, graphqlTypeDeclaration.list.resolver(source, args, context, info)];
                    case 1:
                        customResult = _a.sent();
                        if (customResolverHandle) {
                            customResolverHandle();
                        }
                        return [2 /*return*/, customResult];
                }
            });
        }); };
    }
    var listBefore = graphqlTypeDeclaration.list && graphqlTypeDeclaration.list.before
        ? graphqlTypeDeclaration.list.before
        : undefined;
    var listAfter = graphqlTypeDeclaration.list && graphqlTypeDeclaration.list.after
        ? graphqlTypeDeclaration.list.after
        : undefined;
    return graphql_sequelize_1.resolver(relation || graphqlTypeDeclaration.model, {
        contextToOptions: graphqlTypeDeclaration.list
            ? graphqlTypeDeclaration.list.contextToOptions
            : undefined,
        before: function (findOptions, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
            var processedFindOptions, beforeList, beforeList_1, beforeList_1_1, before, handle, e_1_1, handle, result;
            var e_1, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        processedFindOptions = argsAdvancedProcessing(findOptions, args, context, info, graphqlTypeDeclaration.model, models);
                        if (graphqlTypeDeclaration.list &&
                            graphqlTypeDeclaration.list.enforceMaxLimit) {
                            if (
                            // If the limit is not set, nullish or bigger than the max limit
                            // we enforce it.
                            (!findOptions.limit ||
                                findOptions.limit > graphqlTypeDeclaration.list.enforceMaxLimit) &&
                                // Except if the limit is not on the root query
                                // This is because the limit of sub-Object linked with BelongsToMany is currently not possible
                                // See associationsFields.js L46
                                info.parentType &&
                                info.parentType.name === 'Root_Query') {
                                findOptions.limit = graphqlTypeDeclaration.list.enforceMaxLimit;
                            }
                        }
                        if (!graphqlTypeDeclaration.before) return [3 /*break*/, 8];
                        beforeList = typeof graphqlTypeDeclaration.before.length !== 'undefined'
                            ? graphqlTypeDeclaration.before
                            : [graphqlTypeDeclaration.before];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        beforeList_1 = __values(beforeList), beforeList_1_1 = beforeList_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!beforeList_1_1.done) return [3 /*break*/, 5];
                        before = beforeList_1_1.value;
                        handle = globalPreCallback('listGlobalBefore');
                        return [4 /*yield*/, before(args, context, info)];
                    case 3:
                        _b.sent();
                        if (handle) {
                            handle();
                        }
                        _b.label = 4;
                    case 4:
                        beforeList_1_1 = beforeList_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (beforeList_1_1 && !beforeList_1_1.done && (_a = beforeList_1["return"])) _a.call(beforeList_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        if (!listBefore) return [3 /*break*/, 10];
                        handle = globalPreCallback('listBefore');
                        return [4 /*yield*/, listBefore(processedFindOptions, args, context, info)];
                    case 9:
                        result = _b.sent();
                        if (handle) {
                            handle();
                        }
                        return [2 /*return*/, graphqlTypeDeclaration.list &&
                                graphqlTypeDeclaration.list.removeUnusedAttributes === false
                                ? result
                                : removeUnusedAttributes_1["default"](result, info, graphqlTypeDeclaration.model, models)];
                    case 10: return [2 /*return*/, graphqlTypeDeclaration.list &&
                            graphqlTypeDeclaration.list.removeUnusedAttributes === false
                            ? processedFindOptions
                            : removeUnusedAttributes_1["default"](processedFindOptions, info, graphqlTypeDeclaration.model, models)];
                }
            });
        }); },
        after: function (result, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
            var handle, modifiedResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!listAfter) return [3 /*break*/, 2];
                        handle = globalPreCallback('listAfter');
                        return [4 /*yield*/, listAfter(result, args, context, info)];
                    case 1:
                        modifiedResult = _a.sent();
                        if (handle) {
                            handle();
                        }
                        return [2 /*return*/, modifiedResult];
                    case 2: return [2 /*return*/, result];
                }
            });
        }); }
    });
}
exports["default"] = createResolver;
