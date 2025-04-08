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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var sequelize_1 = require("sequelize");
var removeUnusedAttributes_1 = __importDefault(require("./../removeUnusedAttributes"));
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
        var direction = index === 0 && findOptions.order ? findOptions.order[0][1] : 'ASC';
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
        var parts = field ? field.split('.') : [];
        if (parts.length === 2) {
            var associationName = parts[0];
            if (typeof model.associations[associationName] === 'undefined') {
                throw new Error("Association ".concat(associationName, " unknown on model ").concat(model.name, " order"));
            }
            if (typeof findOptions.include === 'undefined' ||
                typeof findOptions.include === 'string') {
                findOptions.include = [];
            }
            var modelInclude = {
                model: model.associations[associationName].target
            };
            if (model.associations[associationName].as) {
                modelInclude.as = model.associations[associationName].as;
            }
            // Type assertion to specify the type of findOptions.include as an array
            if ('push' in findOptions.include) {
                findOptions.include.push(modelInclude);
            }
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
            if (field &&
                model.rawAttributes[field] &&
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
    if ('map' in findOptions.order) {
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
    }
    findOptions.order = processedOrder;
    return findOptions;
}
var argsAdvancedProcessing = function (findOptions, args, context, info, model, models) {
    var findOptionsWithFlatWhere = allowOrderOnAssociations(findOptions, model);
    // When an association uses a scope, we have to add it to the where condition by default.
    if (info.parentType &&
        models[info.parentType.name] &&
        models[info.parentType.name].associations[info.fieldName].scope) {
        findOptionsWithFlatWhere.where = __assign(__assign({}, (findOptions.where ? findOptions.where : {})), models[info.parentType.name].associations[info.fieldName]
            .scope);
    }
    return findOptionsWithFlatWhere;
};
function trimAndOptimizeFindOptions(_a) {
    var findOptions = _a.findOptions, graphqlTypeDeclaration = _a.graphqlTypeDeclaration, info = _a.info, models = _a.models, args = _a.args;
    return __awaiter(this, void 0, void 0, function () {
        var trimedFindOptions, fetchIdsMultiColumnsFindOptions, result_1, fetchIdsFindOptions, result;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    trimedFindOptions = graphqlTypeDeclaration.list &&
                        graphqlTypeDeclaration.list.removeUnusedAttributes === false
                        ? findOptions
                        : (0, removeUnusedAttributes_1["default"])(findOptions, info, graphqlTypeDeclaration.model, models);
                    // As sequelize-dataloader does not support the include option, we have to remove it.
                    // It does not differenciate between an empty include and an include with models so we have to remove it.
                    if (trimedFindOptions.include &&
                        typeof trimedFindOptions.include === 'object' &&
                        'length' in trimedFindOptions.include &&
                        trimedFindOptions.include.length === 0) {
                        delete trimedFindOptions.include;
                    }
                    // As sequelize-dataloader does not support the where option, we have to remove it.
                    // It does not differenciate between an empty where and a where with properties so we have to remove it.
                    if (trimedFindOptions.where &&
                        // We can only optimize the where if it was not passed as an argument.
                        // This is due to an implementation detail of /node_modules/graphql-sequelize/lib/resolver.js:28:39
                        !args.where &&
                        // Symbols like [Op.and] are not returned by Object.keys and must be handled separately.
                        Object.getOwnPropertySymbols(trimedFindOptions.where).length === 0 &&
                        Object.keys(trimedFindOptions.where).length === 0) {
                        delete trimedFindOptions.where;
                    }
                    if (!
                    // If we have a list with a limit and an offset
                    (trimedFindOptions.limit &&
                        trimedFindOptions.offset &&
                        // And no explicit instructions to not optimize it.
                        // In the majority of the case, doubling the number of queries should be either
                        // faster OR not significantly slower.
                        // As GSG is made to be "easy-to-use", we optimize by default.
                        // We expect limit to be small enough to not cause performance issues.
                        // If you are in a case where you need to fetch a big offset, you should disable the optimization.
                        (!graphqlTypeDeclaration.list ||
                            typeof graphqlTypeDeclaration.list.disableOptimizationForLimitOffset ===
                                'undefined' ||
                            graphqlTypeDeclaration.list.disableOptimizationForLimitOffset !== true))) 
                    // If we have a list with a limit and an offset
                    return [3 /*break*/, 4];
                    if (!(graphqlTypeDeclaration.model.primaryKeyAttributes &&
                        graphqlTypeDeclaration.model.primaryKeyAttributes.length > 0)) return [3 /*break*/, 2];
                    fetchIdsMultiColumnsFindOptions = __assign(__assign({}, trimedFindOptions), { 
                        // We only fetch the primary attribute
                        attributes: graphqlTypeDeclaration.model.primaryKeyAttributes });
                    return [4 /*yield*/, graphqlTypeDeclaration.model.findAll(fetchIdsMultiColumnsFindOptions)];
                case 1:
                    result_1 = _d.sent();
                    return [2 /*return*/, __assign(__assign({}, trimedFindOptions), { offset: undefined, limit: undefined, 
                            // We override the where to only fetch the rows we want.
                            where: (_b = {},
                                _b[sequelize_1.Op.or] = result_1.map(function (r) {
                                    var where = {};
                                    graphqlTypeDeclaration.model.primaryKeyAttributes.forEach(function (attr) {
                                        if (!r[attr]) {
                                            throw new Error("Got a null value for Primary key ".concat(attr, ", for model ").concat(graphqlTypeDeclaration.model.name, ". This should never be the case. Disable the optimization for this model with disableOptimizationForLimitOffset or make sure the primary keys of the table have no null values."));
                                        }
                                        where[attr] = r[attr];
                                    });
                                    return where;
                                }),
                                _b) })];
                case 2:
                    fetchIdsFindOptions = __assign(__assign({}, trimedFindOptions), { 
                        // We only fetch the primary attribute
                        attributes: [graphqlTypeDeclaration.model.primaryKeyAttribute] });
                    return [4 /*yield*/, graphqlTypeDeclaration.model.findAll(fetchIdsFindOptions)];
                case 3:
                    result = _d.sent();
                    return [2 /*return*/, __assign(__assign({}, trimedFindOptions), { offset: undefined, limit: undefined, 
                            // We override the where to only fetch the rows we want.
                            where: (_c = {},
                                _c[graphqlTypeDeclaration.model.primaryKeyAttribute] = result.map(function (r) { return r[graphqlTypeDeclaration.model.primaryKeyAttribute]; }),
                                _c) })];
                case 4: return [2 /*return*/, trimedFindOptions];
            }
        });
    });
}
function createListResolver(graphqlTypeDeclaration, models, globalPreCallback, relation) {
    var _this = this;
    var _a;
    if (relation === void 0) { relation = null; }
    if ((_a = graphqlTypeDeclaration === null || graphqlTypeDeclaration === void 0 ? void 0 : graphqlTypeDeclaration.list) === null || _a === void 0 ? void 0 : _a.resolver) {
        return function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
            var customResolverHandle, customResult;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        customResolverHandle = globalPreCallback('customListBefore');
                        if (!((_a = graphqlTypeDeclaration === null || graphqlTypeDeclaration === void 0 ? void 0 : graphqlTypeDeclaration.list) === null || _a === void 0 ? void 0 : _a.resolver)) return [3 /*break*/, 2];
                        return [4 /*yield*/, graphqlTypeDeclaration.list.resolver(source, args, context, info)];
                    case 1:
                        customResult = _b.sent();
                        if (customResolverHandle) {
                            customResolverHandle();
                        }
                        return [2 /*return*/, customResult];
                    case 2: return [2 /*return*/];
                }
            });
        }); };
    }
    var listBefore = graphqlTypeDeclaration.list && graphqlTypeDeclaration.list.beforeList
        ? graphqlTypeDeclaration.list.beforeList
        : undefined;
    var listAfter = graphqlTypeDeclaration.list && graphqlTypeDeclaration.list.afterList
        ? graphqlTypeDeclaration.list.afterList
        : undefined;
    return (0, graphql_sequelize_1.resolver)(relation || graphqlTypeDeclaration.model, {
        contextToOptions: graphqlTypeDeclaration.list
            ? graphqlTypeDeclaration.list.contextToOptions
            : undefined,
        before: function (findOptions, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
            var processedFindOptions, beforeList, beforeList_1, beforeList_1_1, before, handle, e_1_1, beforeList, beforeList_2, beforeList_2_1, before, handle, resultBefore, e_2_1;
            var e_1, _a, e_2, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!findOptions.where) {
                            findOptions.where = {};
                        }
                        if (typeof findOptions.include === 'undefined') {
                            findOptions.include = [];
                        }
                        processedFindOptions = argsAdvancedProcessing(findOptions, args, context, info, graphqlTypeDeclaration.model, models);
                        if (graphqlTypeDeclaration.list &&
                            graphqlTypeDeclaration.list.enforceMaxLimit) {
                            if ((!findOptions.limit ||
                                findOptions.limit > graphqlTypeDeclaration.list.enforceMaxLimit) &&
                                info.parentType &&
                                info.parentType.name === 'Root_Query') {
                                findOptions.limit = graphqlTypeDeclaration.list.enforceMaxLimit;
                            }
                        }
                        if (!graphqlTypeDeclaration.before) return [3 /*break*/, 8];
                        beforeList = Array.isArray(graphqlTypeDeclaration.before)
                            ? graphqlTypeDeclaration.before
                            : [graphqlTypeDeclaration.before];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, 7, 8]);
                        beforeList_1 = __values(beforeList), beforeList_1_1 = beforeList_1.next();
                        _c.label = 2;
                    case 2:
                        if (!!beforeList_1_1.done) return [3 /*break*/, 5];
                        before = beforeList_1_1.value;
                        handle = globalPreCallback('listGlobalBefore');
                        return [4 /*yield*/, before({ args: args, context: context, info: info })];
                    case 3:
                        _c.sent();
                        if (handle) {
                            handle();
                        }
                        _c.label = 4;
                    case 4:
                        beforeList_1_1 = beforeList_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _c.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (beforeList_1_1 && !beforeList_1_1.done && (_a = beforeList_1["return"])) _a.call(beforeList_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        if (!listBefore) return [3 /*break*/, 16];
                        beforeList = Array.isArray(listBefore)
                            ? listBefore
                            : [listBefore];
                        _c.label = 9;
                    case 9:
                        _c.trys.push([9, 14, 15, 16]);
                        beforeList_2 = __values(beforeList), beforeList_2_1 = beforeList_2.next();
                        _c.label = 10;
                    case 10:
                        if (!!beforeList_2_1.done) return [3 /*break*/, 13];
                        before = beforeList_2_1.value;
                        handle = globalPreCallback('listBefore');
                        return [4 /*yield*/, before({
                                findOptions: processedFindOptions,
                                args: args,
                                context: context,
                                info: info
                            })];
                    case 11:
                        resultBefore = _c.sent();
                        if (!resultBefore) {
                            throw new Error('The before hook of the list endpoint must return a value.');
                        }
                        processedFindOptions = resultBefore;
                        if (handle) {
                            handle();
                        }
                        _c.label = 12;
                    case 12:
                        beforeList_2_1 = beforeList_2.next();
                        return [3 /*break*/, 10];
                    case 13: return [3 /*break*/, 16];
                    case 14:
                        e_2_1 = _c.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 16];
                    case 15:
                        try {
                            if (beforeList_2_1 && !beforeList_2_1.done && (_b = beforeList_2["return"])) _b.call(beforeList_2);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 16: return [2 /*return*/, trimAndOptimizeFindOptions({
                            findOptions: processedFindOptions,
                            graphqlTypeDeclaration: graphqlTypeDeclaration,
                            info: info,
                            models: models,
                            args: args
                        })];
                }
            });
        }); },
        after: function (result, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
            var afterList, modifiedResult, afterList_1, afterList_1_1, after, handle, e_3_1;
            var e_3, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!listAfter) return [3 /*break*/, 9];
                        afterList = Array.isArray(listAfter)
                            ? listAfter
                            : [listAfter];
                        modifiedResult = result;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 6, 7, 8]);
                        afterList_1 = __values(afterList), afterList_1_1 = afterList_1.next();
                        _b.label = 2;
                    case 2:
                        if (!!afterList_1_1.done) return [3 /*break*/, 5];
                        after = afterList_1_1.value;
                        handle = globalPreCallback('listAfter');
                        return [4 /*yield*/, after({
                                result: modifiedResult,
                                args: args,
                                context: context,
                                info: info
                            })];
                    case 3:
                        modifiedResult = _b.sent();
                        if (handle) {
                            handle();
                        }
                        _b.label = 4;
                    case 4:
                        afterList_1_1 = afterList_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_3_1 = _b.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (afterList_1_1 && !afterList_1_1.done && (_a = afterList_1["return"])) _a.call(afterList_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/, modifiedResult];
                    case 9: return [2 /*return*/, result];
                }
            });
        }); }
    });
}
exports["default"] = createListResolver;
