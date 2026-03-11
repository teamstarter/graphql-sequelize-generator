"use strict";
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generateMcpServer;
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
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return shape;
}
/**
 * Generates an McpServer from graphqlSchemaDeclaration and Sequelize models.
 *
 * Only models that have `mcpActions` defined will have MCP tools generated.
 * This is not enabled by default - you must explicitly set `mcpActions` on each model.
 */
function generateMcpServer(graphqlSchemaDeclaration, models, options) {
    var e_2, _a;
    if (options === void 0) { options = {}; }
    var serverInfo = options.serverInfo || {
        name: 'gsg-mcp-server',
        version: '1.0.0',
    };
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
                registerListTool(mcpServer, modelName, model, excludeFields);
            }
            if (mcpActions.includes('count')) {
                registerCountTool(mcpServer, modelName, model);
            }
            if (mcpActions.includes('create')) {
                registerCreateTool(mcpServer, modelName, model, excludeFields);
            }
            if (mcpActions.includes('update')) {
                registerUpdateTool(mcpServer, modelName, model, excludeFields);
            }
            if (mcpActions.includes('delete')) {
                registerDeleteTool(mcpServer, modelName, model);
            }
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return mcpServer;
}
function registerListTool(mcpServer, modelName, model, excludeFields) {
    var _this = this;
    mcpServer.tool("".concat(modelName, "_list"), "List ".concat(modelName, " records"), {
        limit: zod_1.z.number().optional(),
        offset: zod_1.z.number().optional(),
        order: zod_1.z.string().optional(),
    }, function (args) { return __awaiter(_this, void 0, void 0, function () {
        var findOptions, allAttributes, results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
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
                    return [4 /*yield*/, model.findAll(findOptions)];
                case 1:
                    results = _a.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(results.map(function (r) { return r.get({ plain: true }); }), null, 2),
                                },
                            ],
                        }];
            }
        });
    }); });
}
function registerCountTool(mcpServer, modelName, model) {
    var _this = this;
    mcpServer.tool("".concat(modelName, "_count"), "Count ".concat(modelName, " records"), function () { return __awaiter(_this, void 0, void 0, function () {
        var count;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, model.count()];
                case 1:
                    count = _a.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({ count: count }),
                                },
                            ],
                        }];
            }
        });
    }); });
}
function registerCreateTool(mcpServer, modelName, model, excludeFields) {
    var _this = this;
    var shape = buildZodShapeFromModel(model, {
        forInput: true,
        excludeFields: excludeFields,
    });
    mcpServer.tool("".concat(modelName, "_create"), "Create a new ".concat(modelName), shape, function (args) { return __awaiter(_this, void 0, void 0, function () {
        var entity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, model.create(args)];
                case 1:
                    entity = _a.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(entity.get({ plain: true }), null, 2),
                                },
                            ],
                        }];
            }
        });
    }); });
}
function registerUpdateTool(mcpServer, modelName, model, excludeFields) {
    var _this = this;
    var shape = buildZodShapeFromModel(model, {
        forInput: true,
        excludeFields: excludeFields,
    });
    // id is required for update
    shape.id = zod_1.z.number();
    mcpServer.tool("".concat(modelName, "_update"), "Update an existing ".concat(modelName), shape, function (args) { return __awaiter(_this, void 0, void 0, function () {
        var entity, id, updateData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, model.findOne({ where: { id: args.id } })];
                case 1:
                    entity = _a.sent();
                    if (!entity) {
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({ error: "".concat(modelName, " not found") }),
                                    },
                                ],
                                isError: true,
                            }];
                    }
                    id = args.id, updateData = __rest(args, ["id"]);
                    return [4 /*yield*/, entity.update(updateData)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, entity.reload()];
                case 3:
                    _a.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify(entity.get({ plain: true }), null, 2),
                                },
                            ],
                        }];
            }
        });
    }); });
}
function registerDeleteTool(mcpServer, modelName, model) {
    var _this = this;
    mcpServer.tool("".concat(modelName, "_delete"), "Delete a ".concat(modelName, " by id"), {
        id: zod_1.z.number(),
    }, function (args) { return __awaiter(_this, void 0, void 0, function () {
        var entity;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, model.findOne({ where: { id: args.id } })];
                case 1:
                    entity = _a.sent();
                    if (!entity) {
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({ error: "".concat(modelName, " not found") }),
                                    },
                                ],
                                isError: true,
                            }];
                    }
                    return [4 /*yield*/, entity.destroy()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({ deleted: true, id: args.id }),
                                },
                            ],
                        }];
            }
        });
    }); });
}
