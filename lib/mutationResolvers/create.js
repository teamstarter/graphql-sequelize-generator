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
var graphql_1 = require("graphql");
var setWebhookData_1 = __importDefault(require("../webhook/setWebhookData"));
var callModelWebhook_1 = __importDefault(require("./callModelWebhook"));
/**
 * Generates a create mutation operation
 *
 * @param {String} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} model
 * @param {*} graphqlModelDeclaration
 * @param {PubSub} pubSubInstance
 */
function generateMutationCreate(modelName, inputType, outputType, model, graphqlModelDeclaration, globalPreCallback, pubSubInstance, callWebhook) {
    var _a;
    var _this = this;
    if (pubSubInstance === void 0) { pubSubInstance = null; }
    return {
        type: outputType,
        description: "Create a ".concat(modelName),
        args: __assign((_a = {}, _a[modelName] = { type: new graphql_1.GraphQLNonNull(inputType) }, _a), (graphqlModelDeclaration.create &&
            'extraArg' in graphqlModelDeclaration.create &&
            graphqlModelDeclaration.create.extraArg
            ? graphqlModelDeclaration.create.extraArg
            : {})),
        resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
            var attributes, beforeList, beforeList_1, beforeList_1_1, before, handle, e_1_1, beforeList, beforeList_2, beforeList_2_1, before, beforeHandle, e_2_1, preventDuplicateAttributes_1, filters, entityDuplicate, newEntity, error_1, afterList, createdEntity, hookData, afterList_1, afterList_1_1, after, afterHandle, e_3_1;
            var e_1, _a, e_2, _b, e_3, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        attributes = args[modelName];
                        if (!graphqlModelDeclaration.before) return [3 /*break*/, 8];
                        beforeList = Array.isArray(graphqlModelDeclaration.before)
                            ? graphqlModelDeclaration.before
                            : [graphqlModelDeclaration.before];
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 6, 7, 8]);
                        beforeList_1 = __values(beforeList), beforeList_1_1 = beforeList_1.next();
                        _f.label = 2;
                    case 2:
                        if (!!beforeList_1_1.done) return [3 /*break*/, 5];
                        before = beforeList_1_1.value;
                        handle = globalPreCallback('createGlobalBefore');
                        return [4 /*yield*/, before({ args: args, context: context, info: info })];
                    case 3:
                        _f.sent();
                        if (handle) {
                            handle();
                        }
                        _f.label = 4;
                    case 4:
                        beforeList_1_1 = beforeList_1.next();
                        return [3 /*break*/, 2];
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1_1 = _f.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 8];
                    case 7:
                        try {
                            if (beforeList_1_1 && !beforeList_1_1.done && (_a = beforeList_1["return"])) _a.call(beforeList_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                        return [7 /*endfinally*/];
                    case 8:
                        if (!(graphqlModelDeclaration.create &&
                            'before' in graphqlModelDeclaration.create &&
                            graphqlModelDeclaration.create.before)) return [3 /*break*/, 16];
                        beforeList = Array.isArray(graphqlModelDeclaration.create.before)
                            ? graphqlModelDeclaration.create.before
                            : [graphqlModelDeclaration.create.before];
                        _f.label = 9;
                    case 9:
                        _f.trys.push([9, 14, 15, 16]);
                        beforeList_2 = __values(beforeList), beforeList_2_1 = beforeList_2.next();
                        _f.label = 10;
                    case 10:
                        if (!!beforeList_2_1.done) return [3 /*break*/, 13];
                        before = beforeList_2_1.value;
                        beforeHandle = globalPreCallback('createBefore');
                        return [4 /*yield*/, before({
                                source: source,
                                args: args,
                                context: context,
                                info: info
                            })];
                    case 11:
                        attributes = _f.sent();
                        if (!attributes) {
                            throw new Error('The before hook must always return the create method first parameter.');
                        }
                        if (beforeHandle) {
                            beforeHandle();
                        }
                        _f.label = 12;
                    case 12:
                        beforeList_2_1 = beforeList_2.next();
                        return [3 /*break*/, 10];
                    case 13: return [3 /*break*/, 16];
                    case 14:
                        e_2_1 = _f.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 16];
                    case 15:
                        try {
                            if (beforeList_2_1 && !beforeList_2_1.done && (_b = beforeList_2["return"])) _b.call(beforeList_2);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 16:
                        if (!(graphqlModelDeclaration.create &&
                            'preventDuplicateOnAttributes' in graphqlModelDeclaration.create &&
                            graphqlModelDeclaration.create.preventDuplicateOnAttributes)) return [3 /*break*/, 19];
                        preventDuplicateAttributes_1 = graphqlModelDeclaration.create.preventDuplicateOnAttributes;
                        filters = Object.keys(attributes).reduce(function (acc, key) {
                            if (preventDuplicateAttributes_1.includes(key)) {
                                acc[key] = attributes[key] ? attributes[key] : null;
                            }
                            return acc;
                        }, {});
                        entityDuplicate = null;
                        if (!Object.keys(filters).length) return [3 /*break*/, 18];
                        return [4 /*yield*/, model.findOne({
                                where: filters
                            })];
                    case 17:
                        entityDuplicate = _f.sent();
                        _f.label = 18;
                    case 18:
                        if (entityDuplicate) {
                            return [2 /*return*/, entityDuplicate];
                        }
                        _f.label = 19;
                    case 19:
                        newEntity = undefined;
                        _f.label = 20;
                    case 20:
                        _f.trys.push([20, 22, , 23]);
                        return [4 /*yield*/, model.create(attributes)];
                    case 21:
                        newEntity = _f.sent();
                        return [3 /*break*/, 23];
                    case 22:
                        error_1 = _f.sent();
                        if (error_1 instanceof Error) {
                            throw error_1;
                        }
                        throw new Error('Unknown error occurred while creating entity');
                    case 23:
                        if (!newEntity) {
                            return [2 /*return*/, undefined];
                        }
                        if (!(graphqlModelDeclaration.create &&
                            'after' in graphqlModelDeclaration.create &&
                            graphqlModelDeclaration.create.after)) return [3 /*break*/, 33];
                        afterList = Array.isArray(graphqlModelDeclaration.create.after)
                            ? graphqlModelDeclaration.create.after
                            : [graphqlModelDeclaration.create.after];
                        createdEntity = newEntity;
                        hookData = { data: createdEntity.get({ plain: true }) };
                        _f.label = 24;
                    case 24:
                        _f.trys.push([24, 29, 30, 31]);
                        afterList_1 = __values(afterList), afterList_1_1 = afterList_1.next();
                        _f.label = 25;
                    case 25:
                        if (!!afterList_1_1.done) return [3 /*break*/, 28];
                        after = afterList_1_1.value;
                        afterHandle = globalPreCallback('createAfter');
                        return [4 /*yield*/, after({
                                createdEntity: createdEntity,
                                source: source,
                                args: args,
                                context: context,
                                info: info,
                                setWebhookData: (0, setWebhookData_1["default"])(hookData)
                            })];
                    case 26:
                        createdEntity = _f.sent();
                        if (afterHandle) {
                            afterHandle();
                        }
                        _f.label = 27;
                    case 27:
                        afterList_1_1 = afterList_1.next();
                        return [3 /*break*/, 25];
                    case 28: return [3 /*break*/, 31];
                    case 29:
                        e_3_1 = _f.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 31];
                    case 30:
                        try {
                            if (afterList_1_1 && !afterList_1_1.done && (_c = afterList_1["return"])) _c.call(afterList_1);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 31:
                        if (pubSubInstance) {
                            pubSubInstance.publish("".concat(modelName, "Created"), (_d = {},
                                _d["".concat(modelName, "Created")] = createdEntity.get(),
                                _d));
                        }
                        return [4 /*yield*/, (0, callModelWebhook_1["default"])(modelName, graphqlModelDeclaration.webhooks, 'create', context, hookData.data, callWebhook)];
                    case 32:
                        _f.sent();
                        return [2 /*return*/, createdEntity];
                    case 33:
                        if (pubSubInstance) {
                            pubSubInstance.publish("".concat(modelName, "Created"), (_e = {},
                                _e["".concat(modelName, "Created")] = newEntity.get(),
                                _e));
                        }
                        return [4 /*yield*/, (0, callModelWebhook_1["default"])(modelName, graphqlModelDeclaration.webhooks, 'create', context, __assign({}, newEntity.get({ plain: true })), callWebhook)];
                    case 34:
                        _f.sent();
                        return [2 /*return*/, newEntity];
                }
            });
        }); }
    };
}
exports["default"] = generateMutationCreate;
