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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
var mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
var zod_1 = require("zod");
/**
 * Converts a Sequelize attribute type key to a Zod schema.
 */
function sequelizeTypeToZod(typeKey, allowNull) {
    var schema;
    switch (typeKey) {
        case 'INTEGER':
        case 'BIGINT':
        case 'FLOAT':
        case 'REAL':
        case 'DOUBLE':
        case 'DOUBLE PRECISION':
        case 'DECIMAL':
            schema = zod_1.z.number();
            break;
        case 'BOOLEAN':
            schema = zod_1.z.boolean();
            break;
        case 'DATE':
        case 'DATEONLY':
            schema = zod_1.z.string();
            break;
        case 'JSON':
        case 'JSONB':
            schema = zod_1.z.any();
            break;
        default:
            schema = zod_1.z.string();
            break;
    }
    if (allowNull) {
        schema = schema.optional();
    }
    return schema;
}
/**
 * Builds a Zod shape from a Sequelize model's attributes.
 * If forInput is true, the 'id' field is excluded and all fields are optional.
 */
function buildZodShapeFromModel(model, options) {
    var e_1, _a;
    if (options === void 0) { options = {}; }
    var attributes = model.getAttributes();
    var shape = {};
    var excludeFields = options.excludeFields || [];
    try {
        for (var _b = __values(Object.entries(attributes)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), name_1 = _d[0], attr = _d[1];
            if (excludeFields.includes(name_1))
                continue;
            if (name_1 === 'createdAt' || name_1 === 'updatedAt')
                continue;
            if (options.forInput && name_1 === 'id')
                continue;
            var typeKey = attr.type.key || attr.type.constructor.name;
            var allowNull = options.forInput ? true : !!attr.allowNull;
            shape[name_1] = sequelizeTypeToZod(typeKey, allowNull);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return shape;
}
/**
 * Runs the global before hooks from the model declaration.
 */
function runGlobalBeforeHooks(modelDeclaration, args, context) {
    return __awaiter(this, void 0, void 0, function () {
        var beforeList, beforeList_1, beforeList_1_1, before, e_2_1;
        var e_2, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!modelDeclaration.before)
                        return [2 /*return*/];
                    beforeList = Array.isArray(modelDeclaration.before)
                        ? modelDeclaration.before
                        : [modelDeclaration.before];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 8]);
                    beforeList_1 = __values(beforeList), beforeList_1_1 = beforeList_1.next();
                    _b.label = 2;
                case 2:
                    if (!!beforeList_1_1.done) return [3 /*break*/, 5];
                    before = beforeList_1_1.value;
                    return [4 /*yield*/, before({ args: args, context: context, info: {} })];
                case 3:
                    _b.sent();
                    _b.label = 4;
                case 4:
                    beforeList_1_1 = beforeList_1.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (beforeList_1_1 && !beforeList_1_1.done && (_a = beforeList_1["return"])) _a.call(beforeList_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Generates an McpServer from graphqlSchemaDeclaration and Sequelize models.
 *
 * Only models that have `mcpActions` defined will have MCP tools generated.
 * This is not enabled by default - you must explicitly set `mcpActions` on each model.
 *
 * The `context` option works like GraphQL's context: it receives the MCP extra
 * metadata (sessionId, etc.) and returns a context object passed to all hooks.
 */
function generateMcpServer(graphqlSchemaDeclaration, models, options) {
    var e_3, _a;
    if (options === void 0) { options = {}; }
    var serverInfo = options.serverInfo || {
        name: 'gsg-mcp-server',
        version: '1.0.0'
    };
    var contextFn = options.context || (function () { return ({}); });
    var mcpServer = new mcp_js_1.McpServer(serverInfo);
    try {
        for (var _b = __values(Object.keys(graphqlSchemaDeclaration)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var modelName = _c.value;
            var declaration = graphqlSchemaDeclaration[modelName];
            // Skip non-model declarations (custom GraphQL fields)
            if (!('model' in declaration))
                continue;
            var modelDeclaration = declaration;
            // Only generate MCP tools if mcpActions is explicitly defined
            if (!modelDeclaration.mcpActions || modelDeclaration.mcpActions.length === 0)
                continue;
            var model = modelDeclaration.model;
            var mcpActions = modelDeclaration.mcpActions;
            var excludeFields = modelDeclaration.excludeFields || [];
            if (mcpActions.includes('list')) {
                registerListTool(mcpServer, modelName, model, excludeFields, modelDeclaration, contextFn);
            }
            if (mcpActions.includes('count')) {
                registerCountTool(mcpServer, modelName, model, modelDeclaration, contextFn);
            }
            if (mcpActions.includes('create')) {
                registerCreateTool(mcpServer, modelName, model, excludeFields, modelDeclaration, contextFn);
            }
            if (mcpActions.includes('update')) {
                registerUpdateTool(mcpServer, modelName, model, excludeFields, modelDeclaration, contextFn);
            }
            if (mcpActions.includes('delete')) {
                registerDeleteTool(mcpServer, modelName, model, modelDeclaration, contextFn);
            }
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return mcpServer;
}
exports["default"] = generateMcpServer;
function registerListTool(mcpServer, modelName, model, excludeFields, modelDeclaration, contextFn) {
    var _this = this;
    mcpServer.tool("".concat(modelName, "_list"), "List ".concat(modelName, " records"), {
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        order: zod_1.z.string().optional()
    }, function (args, extra) { return __awaiter(_this, void 0, void 0, function () {
        var context, findOptions, allAttributes, beforeList, beforeList_2, beforeList_2_1, before, result, e_4_1, results, afterList, afterList_1, afterList_1_1, after, result, e_5_1;
        var e_4, _a, e_5, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, contextFn(extra)];
                case 1:
                    context = _c.sent();
                    return [4 /*yield*/, runGlobalBeforeHooks(modelDeclaration, args, context)];
                case 2:
                    _c.sent();
                    findOptions = {};
                    if (args.limit !== undefined)
                        findOptions.limit = args.limit;
                    if (args.offset !== undefined)
                        findOptions.offset = args.offset;
                    if (args.order) {
                        findOptions.order = [[args.order, 'ASC']];
                    }
                    if (excludeFields.length > 0) {
                        allAttributes = Object.keys(model.getAttributes());
                        findOptions.attributes = allAttributes.filter(function (a) { return !excludeFields.includes(a); });
                    }
                    if (!(modelDeclaration.list &&
                        'before' in modelDeclaration.list &&
                        modelDeclaration.list.before)) return [3 /*break*/, 10];
                    beforeList = Array.isArray(modelDeclaration.list.before)
                        ? modelDeclaration.list.before
                        : [modelDeclaration.list.before];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 8, 9, 10]);
                    beforeList_2 = __values(beforeList), beforeList_2_1 = beforeList_2.next();
                    _c.label = 4;
                case 4:
                    if (!!beforeList_2_1.done) return [3 /*break*/, 7];
                    before = beforeList_2_1.value;
                    return [4 /*yield*/, before({
                            findOptions: findOptions,
                            args: args,
                            context: context,
                            info: {}
                        })];
                case 5:
                    result = _c.sent();
                    if (result) {
                        Object.assign(findOptions, result);
                    }
                    _c.label = 6;
                case 6:
                    beforeList_2_1 = beforeList_2.next();
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 10];
                case 8:
                    e_4_1 = _c.sent();
                    e_4 = { error: e_4_1 };
                    return [3 /*break*/, 10];
                case 9:
                    try {
                        if (beforeList_2_1 && !beforeList_2_1.done && (_a = beforeList_2["return"])) _a.call(beforeList_2);
                    }
                    finally { if (e_4) throw e_4.error; }
                    return [7 /*endfinally*/];
                case 10: return [4 /*yield*/, model.findAll(findOptions)
                    // Run list after hooks
                ];
                case 11:
                    results = _c.sent();
                    if (!(modelDeclaration.list &&
                        'after' in modelDeclaration.list &&
                        modelDeclaration.list.after)) return [3 /*break*/, 19];
                    afterList = Array.isArray(modelDeclaration.list.after)
                        ? modelDeclaration.list.after
                        : [modelDeclaration.list.after];
                    _c.label = 12;
                case 12:
                    _c.trys.push([12, 17, 18, 19]);
                    afterList_1 = __values(afterList), afterList_1_1 = afterList_1.next();
                    _c.label = 13;
                case 13:
                    if (!!afterList_1_1.done) return [3 /*break*/, 16];
                    after = afterList_1_1.value;
                    return [4 /*yield*/, after({
                            result: results,
                            args: args,
                            context: context,
                            info: {}
                        })];
                case 14:
                    result = _c.sent();
                    if (result) {
                        results = result;
                    }
                    _c.label = 15;
                case 15:
                    afterList_1_1 = afterList_1.next();
                    return [3 /*break*/, 13];
                case 16: return [3 /*break*/, 19];
                case 17:
                    e_5_1 = _c.sent();
                    e_5 = { error: e_5_1 };
                    return [3 /*break*/, 19];
                case 18:
                    try {
                        if (afterList_1_1 && !afterList_1_1.done && (_b = afterList_1["return"])) _b.call(afterList_1);
                    }
                    finally { if (e_5) throw e_5.error; }
                    return [7 /*endfinally*/];
                case 19: return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(results.map(function (r) {
                                    return typeof r.get === 'function' ? r.get({ plain: true }) : r;
                                }), null, 2)
                            },
                        ]
                    }];
            }
        });
    }); });
}
function registerCountTool(mcpServer, modelName, model, modelDeclaration, contextFn) {
    var _this = this;
    mcpServer.tool("".concat(modelName, "_count"), "Count ".concat(modelName, " records"), function (extra) { return __awaiter(_this, void 0, void 0, function () {
        var context, findOptions, countDecl, beforeList, beforeList_3, beforeList_3_1, before, result, e_6_1, count;
        var e_6, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, contextFn(extra)];
                case 1:
                    context = _b.sent();
                    return [4 /*yield*/, runGlobalBeforeHooks(modelDeclaration, {}, context)];
                case 2:
                    _b.sent();
                    findOptions = {};
                    countDecl = modelDeclaration.count;
                    if (!(countDecl && 'before' in countDecl && countDecl.before)) return [3 /*break*/, 10];
                    beforeList = Array.isArray(countDecl.before)
                        ? countDecl.before
                        : [countDecl.before];
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 8, 9, 10]);
                    beforeList_3 = __values(beforeList), beforeList_3_1 = beforeList_3.next();
                    _b.label = 4;
                case 4:
                    if (!!beforeList_3_1.done) return [3 /*break*/, 7];
                    before = beforeList_3_1.value;
                    return [4 /*yield*/, before({
                            findOptions: findOptions,
                            args: {},
                            context: context,
                            info: {}
                        })];
                case 5:
                    result = _b.sent();
                    if (result) {
                        Object.assign(findOptions, result);
                    }
                    _b.label = 6;
                case 6:
                    beforeList_3_1 = beforeList_3.next();
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 10];
                case 8:
                    e_6_1 = _b.sent();
                    e_6 = { error: e_6_1 };
                    return [3 /*break*/, 10];
                case 9:
                    try {
                        if (beforeList_3_1 && !beforeList_3_1.done && (_a = beforeList_3["return"])) _a.call(beforeList_3);
                    }
                    finally { if (e_6) throw e_6.error; }
                    return [7 /*endfinally*/];
                case 10: return [4 /*yield*/, model.count(findOptions)];
                case 11:
                    count = _b.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({ count: count })
                                },
                            ]
                        }];
            }
        });
    }); });
}
function registerCreateTool(mcpServer, modelName, model, excludeFields, modelDeclaration, contextFn) {
    var _this = this;
    var shape = buildZodShapeFromModel(model, {
        forInput: true,
        excludeFields: excludeFields
    });
    mcpServer.tool("".concat(modelName, "_create"), "Create a new ".concat(modelName), shape, function (args, extra) { return __awaiter(_this, void 0, void 0, function () {
        var context, attributes, beforeList, beforeList_4, beforeList_4_1, before, result, e_7_1, entity, afterList, createdEntity, afterList_2, afterList_2_1, after, result, e_8_1;
        var e_7, _a, _b, e_8, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, contextFn(extra)];
                case 1:
                    context = _e.sent();
                    return [4 /*yield*/, runGlobalBeforeHooks(modelDeclaration, args, context)];
                case 2:
                    _e.sent();
                    attributes = __assign({}, args);
                    if (!(modelDeclaration.create &&
                        'before' in modelDeclaration.create &&
                        modelDeclaration.create.before)) return [3 /*break*/, 10];
                    beforeList = Array.isArray(modelDeclaration.create.before)
                        ? modelDeclaration.create.before
                        : [modelDeclaration.create.before];
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 8, 9, 10]);
                    beforeList_4 = __values(beforeList), beforeList_4_1 = beforeList_4.next();
                    _e.label = 4;
                case 4:
                    if (!!beforeList_4_1.done) return [3 /*break*/, 7];
                    before = beforeList_4_1.value;
                    return [4 /*yield*/, before({
                            source: null,
                            args: __assign((_b = {}, _b[modelName] = attributes, _b), args),
                            context: context,
                            info: {}
                        })];
                case 5:
                    result = _e.sent();
                    if (result) {
                        attributes = result;
                    }
                    _e.label = 6;
                case 6:
                    beforeList_4_1 = beforeList_4.next();
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 10];
                case 8:
                    e_7_1 = _e.sent();
                    e_7 = { error: e_7_1 };
                    return [3 /*break*/, 10];
                case 9:
                    try {
                        if (beforeList_4_1 && !beforeList_4_1.done && (_a = beforeList_4["return"])) _a.call(beforeList_4);
                    }
                    finally { if (e_7) throw e_7.error; }
                    return [7 /*endfinally*/];
                case 10: return [4 /*yield*/, model.create(attributes)
                    // Run create after hooks
                ];
                case 11:
                    entity = _e.sent();
                    if (!(modelDeclaration.create &&
                        'after' in modelDeclaration.create &&
                        modelDeclaration.create.after)) return [3 /*break*/, 20];
                    afterList = Array.isArray(modelDeclaration.create.after)
                        ? modelDeclaration.create.after
                        : [modelDeclaration.create.after];
                    createdEntity = entity;
                    _e.label = 12;
                case 12:
                    _e.trys.push([12, 17, 18, 19]);
                    afterList_2 = __values(afterList), afterList_2_1 = afterList_2.next();
                    _e.label = 13;
                case 13:
                    if (!!afterList_2_1.done) return [3 /*break*/, 16];
                    after = afterList_2_1.value;
                    return [4 /*yield*/, after({
                            createdEntity: createdEntity,
                            source: null,
                            args: __assign((_d = {}, _d[modelName] = attributes, _d), args),
                            context: context,
                            info: {}
                        })];
                case 14:
                    result = _e.sent();
                    if (result) {
                        createdEntity = result;
                    }
                    _e.label = 15;
                case 15:
                    afterList_2_1 = afterList_2.next();
                    return [3 /*break*/, 13];
                case 16: return [3 /*break*/, 19];
                case 17:
                    e_8_1 = _e.sent();
                    e_8 = { error: e_8_1 };
                    return [3 /*break*/, 19];
                case 18:
                    try {
                        if (afterList_2_1 && !afterList_2_1.done && (_c = afterList_2["return"])) _c.call(afterList_2);
                    }
                    finally { if (e_8) throw e_8.error; }
                    return [7 /*endfinally*/];
                case 19: return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(createdEntity.get({ plain: true }), null, 2)
                            },
                        ]
                    }];
                case 20: return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(entity.get({ plain: true }), null, 2)
                            },
                        ]
                    }];
            }
        });
    }); });
}
function registerUpdateTool(mcpServer, modelName, model, excludeFields, modelDeclaration, contextFn) {
    var _this = this;
    var shape = buildZodShapeFromModel(model, {
        forInput: true,
        excludeFields: excludeFields
    });
    // id is required for update
    shape.id = zod_1.z.number();
    mcpServer.tool("".concat(modelName, "_update"), "Update an existing ".concat(modelName), shape, function (args, extra) { return __awaiter(_this, void 0, void 0, function () {
        var context, entity, id, updateData, attributes, beforeList, beforeList_5, beforeList_5_1, before, result, e_9_1, previousPropertiesSnapshot, afterList, updatedEntity, afterList_3, afterList_3_1, after, result, e_10_1;
        var e_9, _a, _b, e_10, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0: return [4 /*yield*/, contextFn(extra)];
                case 1:
                    context = _e.sent();
                    return [4 /*yield*/, runGlobalBeforeHooks(modelDeclaration, args, context)];
                case 2:
                    _e.sent();
                    return [4 /*yield*/, model.findOne({ where: { id: args.id } })];
                case 3:
                    entity = _e.sent();
                    if (!entity) {
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({ error: "".concat(modelName, " not found") })
                                    },
                                ],
                                isError: true
                            }];
                    }
                    id = args.id, updateData = __rest(args, ["id"]);
                    attributes = updateData;
                    if (!(modelDeclaration.update &&
                        'before' in modelDeclaration.update &&
                        modelDeclaration.update.before)) return [3 /*break*/, 11];
                    beforeList = Array.isArray(modelDeclaration.update.before)
                        ? modelDeclaration.update.before
                        : [modelDeclaration.update.before];
                    _e.label = 4;
                case 4:
                    _e.trys.push([4, 9, 10, 11]);
                    beforeList_5 = __values(beforeList), beforeList_5_1 = beforeList_5.next();
                    _e.label = 5;
                case 5:
                    if (!!beforeList_5_1.done) return [3 /*break*/, 8];
                    before = beforeList_5_1.value;
                    return [4 /*yield*/, before({
                            source: null,
                            args: __assign((_b = {}, _b[modelName] = attributes, _b.id = id, _b), args),
                            context: context,
                            info: {}
                        })];
                case 6:
                    result = _e.sent();
                    if (result) {
                        attributes = result;
                    }
                    _e.label = 7;
                case 7:
                    beforeList_5_1 = beforeList_5.next();
                    return [3 /*break*/, 5];
                case 8: return [3 /*break*/, 11];
                case 9:
                    e_9_1 = _e.sent();
                    e_9 = { error: e_9_1 };
                    return [3 /*break*/, 11];
                case 10:
                    try {
                        if (beforeList_5_1 && !beforeList_5_1.done && (_a = beforeList_5["return"])) _a.call(beforeList_5);
                    }
                    finally { if (e_9) throw e_9.error; }
                    return [7 /*endfinally*/];
                case 11:
                    previousPropertiesSnapshot = __assign({}, entity.get({ plain: true }));
                    return [4 /*yield*/, entity.update(attributes)];
                case 12:
                    _e.sent();
                    return [4 /*yield*/, entity.reload()
                        // Run update after hooks
                    ];
                case 13:
                    _e.sent();
                    if (!(modelDeclaration.update &&
                        'after' in modelDeclaration.update &&
                        modelDeclaration.update.after)) return [3 /*break*/, 22];
                    afterList = Array.isArray(modelDeclaration.update.after)
                        ? modelDeclaration.update.after
                        : [modelDeclaration.update.after];
                    updatedEntity = entity;
                    _e.label = 14;
                case 14:
                    _e.trys.push([14, 19, 20, 21]);
                    afterList_3 = __values(afterList), afterList_3_1 = afterList_3.next();
                    _e.label = 15;
                case 15:
                    if (!!afterList_3_1.done) return [3 /*break*/, 18];
                    after = afterList_3_1.value;
                    return [4 /*yield*/, after({
                            updatedEntity: updatedEntity,
                            previousPropertiesSnapshot: previousPropertiesSnapshot,
                            source: null,
                            args: __assign((_d = {}, _d[modelName] = attributes, _d.id = id, _d), args),
                            context: context,
                            info: {}
                        })];
                case 16:
                    result = _e.sent();
                    if (result) {
                        updatedEntity = result;
                    }
                    _e.label = 17;
                case 17:
                    afterList_3_1 = afterList_3.next();
                    return [3 /*break*/, 15];
                case 18: return [3 /*break*/, 21];
                case 19:
                    e_10_1 = _e.sent();
                    e_10 = { error: e_10_1 };
                    return [3 /*break*/, 21];
                case 20:
                    try {
                        if (afterList_3_1 && !afterList_3_1.done && (_c = afterList_3["return"])) _c.call(afterList_3);
                    }
                    finally { if (e_10) throw e_10.error; }
                    return [7 /*endfinally*/];
                case 21: return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(updatedEntity.get({ plain: true }), null, 2)
                            },
                        ]
                    }];
                case 22: return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify(entity.get({ plain: true }), null, 2)
                            },
                        ]
                    }];
            }
        });
    }); });
}
function registerDeleteTool(mcpServer, modelName, model, modelDeclaration, contextFn) {
    var _this = this;
    mcpServer.tool("".concat(modelName, "_delete"), "Delete a ".concat(modelName, " by id"), {
        id: zod_1.z.number()
    }, function (args, extra) { return __awaiter(_this, void 0, void 0, function () {
        var context, where, beforeList, beforeList_6, beforeList_6_1, before, result, e_11_1, entity, snapshotBeforeDelete, afterList, afterList_4, afterList_4_1, after, e_12_1;
        var e_11, _a, e_12, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, contextFn(extra)];
                case 1:
                    context = _c.sent();
                    return [4 /*yield*/, runGlobalBeforeHooks(modelDeclaration, args, context)];
                case 2:
                    _c.sent();
                    where = { id: args.id };
                    if (!(modelDeclaration["delete"] &&
                        'before' in modelDeclaration["delete"] &&
                        modelDeclaration["delete"].before)) return [3 /*break*/, 10];
                    beforeList = Array.isArray(modelDeclaration["delete"].before)
                        ? modelDeclaration["delete"].before
                        : [modelDeclaration["delete"].before];
                    _c.label = 3;
                case 3:
                    _c.trys.push([3, 8, 9, 10]);
                    beforeList_6 = __values(beforeList), beforeList_6_1 = beforeList_6.next();
                    _c.label = 4;
                case 4:
                    if (!!beforeList_6_1.done) return [3 /*break*/, 7];
                    before = beforeList_6_1.value;
                    return [4 /*yield*/, before({
                            where: where,
                            source: null,
                            args: args,
                            context: context,
                            info: {}
                        })];
                case 5:
                    result = _c.sent();
                    if (result) {
                        where = result;
                    }
                    _c.label = 6;
                case 6:
                    beforeList_6_1 = beforeList_6.next();
                    return [3 /*break*/, 4];
                case 7: return [3 /*break*/, 10];
                case 8:
                    e_11_1 = _c.sent();
                    e_11 = { error: e_11_1 };
                    return [3 /*break*/, 10];
                case 9:
                    try {
                        if (beforeList_6_1 && !beforeList_6_1.done && (_a = beforeList_6["return"])) _a.call(beforeList_6);
                    }
                    finally { if (e_11) throw e_11.error; }
                    return [7 /*endfinally*/];
                case 10: return [4 /*yield*/, model.findOne({ where: where })];
                case 11:
                    entity = _c.sent();
                    if (!entity) {
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({ error: "".concat(modelName, " not found") })
                                    },
                                ],
                                isError: true
                            }];
                    }
                    snapshotBeforeDelete = __assign({}, entity.get({ plain: true }));
                    return [4 /*yield*/, entity.destroy()
                        // Run delete after hooks
                    ];
                case 12:
                    _c.sent();
                    if (!(modelDeclaration["delete"] &&
                        'after' in modelDeclaration["delete"] &&
                        modelDeclaration["delete"].after)) return [3 /*break*/, 20];
                    afterList = Array.isArray(modelDeclaration["delete"].after)
                        ? modelDeclaration["delete"].after
                        : [modelDeclaration["delete"].after];
                    _c.label = 13;
                case 13:
                    _c.trys.push([13, 18, 19, 20]);
                    afterList_4 = __values(afterList), afterList_4_1 = afterList_4.next();
                    _c.label = 14;
                case 14:
                    if (!!afterList_4_1.done) return [3 /*break*/, 17];
                    after = afterList_4_1.value;
                    return [4 /*yield*/, after({
                            deletedEntity: entity,
                            source: null,
                            args: args,
                            context: context,
                            info: {}
                        })];
                case 15:
                    _c.sent();
                    _c.label = 16;
                case 16:
                    afterList_4_1 = afterList_4.next();
                    return [3 /*break*/, 14];
                case 17: return [3 /*break*/, 20];
                case 18:
                    e_12_1 = _c.sent();
                    e_12 = { error: e_12_1 };
                    return [3 /*break*/, 20];
                case 19:
                    try {
                        if (afterList_4_1 && !afterList_4_1.done && (_b = afterList_4["return"])) _b.call(afterList_4);
                    }
                    finally { if (e_12) throw e_12.error; }
                    return [7 /*endfinally*/];
                case 20: return [2 /*return*/, {
                        content: [
                            {
                                type: 'text',
                                text: JSON.stringify({ deleted: true, id: args.id })
                            },
                        ]
                    }];
            }
        });
    }); });
}
