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
var callModelWebhook_1 = __importDefault(require("./callModelWebhook"));
/**
 * Generates a delete mutation operation
 *
 * @param {String} modelName
 * @param {*} inputType
 * @param {*} outputType
 * @param {*} graphqlModelDeclaration
 * @param {*} models
 * @param {PubSub} pubSubInstance
 */
function generateMutationDelete(modelName, graphqlModelDeclaration, models, globalPreCallback, pubSubInstance, callWebhook) {
    var _this = this;
    if (pubSubInstance === void 0) { pubSubInstance = null; }
    return {
        type: graphql_1.GraphQLInt,
        description: "Delete a ".concat(modelName),
        args: __assign({ id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) } }, (graphqlModelDeclaration["delete"] &&
            'extraArg' in graphqlModelDeclaration["delete"] &&
            graphqlModelDeclaration["delete"].extraArg
            ? graphqlModelDeclaration["delete"].extraArg
            : {})),
        resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
            var where, beforeList, beforeList_1, beforeList_1_1, before, handle, e_1_1, beforeList, beforeList_2, beforeList_2_1, before, beforeHandle, result, e_2_1, entity, beforeList, beforeList_3, beforeList_3_1, before, beforeHandle, e_3_1, snapshotBeforeDelete, hookData, afterList, afterList_1, afterList_1_1, after, afterHandle, e_4_1;
            var e_1, _a, e_2, _b, e_3, _c, _d, e_4, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        where = { id: args.id };
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
                        handle = globalPreCallback('deleteGlobalBefore');
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
                        if (!(graphqlModelDeclaration["delete"] &&
                            'beforeDeleteFetch' in graphqlModelDeclaration["delete"] &&
                            graphqlModelDeclaration["delete"].beforeDeleteFetch)) return [3 /*break*/, 16];
                        beforeList = Array.isArray(graphqlModelDeclaration["delete"].beforeDeleteFetch)
                            ? graphqlModelDeclaration["delete"].beforeDeleteFetch
                            : [
                                graphqlModelDeclaration["delete"]
                                    .beforeDeleteFetch,
                            ];
                        _f.label = 9;
                    case 9:
                        _f.trys.push([9, 14, 15, 16]);
                        beforeList_2 = __values(beforeList), beforeList_2_1 = beforeList_2.next();
                        _f.label = 10;
                    case 10:
                        if (!!beforeList_2_1.done) return [3 /*break*/, 13];
                        before = beforeList_2_1.value;
                        beforeHandle = globalPreCallback('beforeDeleteFetch');
                        return [4 /*yield*/, before({
                                where: where,
                                source: source,
                                args: args,
                                context: context,
                                info: info
                            })
                            // The return value of the before hook is used as the where for the next hook
                        ];
                    case 11:
                        result = _f.sent();
                        // The return value of the before hook is used as the where for the next hook
                        if (result) {
                            where = result;
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
                    case 16: return [4 /*yield*/, models[modelName].findOne({
                            where: where
                        })];
                    case 17:
                        entity = _f.sent();
                        if (!entity) {
                            throw new Error("".concat(modelName, " not found."));
                        }
                        if (!(graphqlModelDeclaration["delete"] &&
                            'beforeDelete' in graphqlModelDeclaration["delete"] &&
                            graphqlModelDeclaration["delete"].beforeDelete)) return [3 /*break*/, 25];
                        beforeList = Array.isArray(graphqlModelDeclaration["delete"].beforeDelete)
                            ? graphqlModelDeclaration["delete"].beforeDelete
                            : [
                                graphqlModelDeclaration["delete"].beforeDelete,
                            ];
                        _f.label = 18;
                    case 18:
                        _f.trys.push([18, 23, 24, 25]);
                        beforeList_3 = __values(beforeList), beforeList_3_1 = beforeList_3.next();
                        _f.label = 19;
                    case 19:
                        if (!!beforeList_3_1.done) return [3 /*break*/, 22];
                        before = beforeList_3_1.value;
                        beforeHandle = globalPreCallback('beforeDelete');
                        return [4 /*yield*/, before({
                                entity: entity,
                                where: where,
                                source: source,
                                args: args,
                                context: context,
                                info: info
                            })];
                    case 20:
                        entity = _f.sent();
                        if (beforeHandle) {
                            beforeHandle();
                        }
                        _f.label = 21;
                    case 21:
                        beforeList_3_1 = beforeList_3.next();
                        return [3 /*break*/, 19];
                    case 22: return [3 /*break*/, 25];
                    case 23:
                        e_3_1 = _f.sent();
                        e_3 = { error: e_3_1 };
                        return [3 /*break*/, 25];
                    case 24:
                        try {
                            if (beforeList_3_1 && !beforeList_3_1.done && (_c = beforeList_3["return"])) _c.call(beforeList_3);
                        }
                        finally { if (e_3) throw e_3.error; }
                        return [7 /*endfinally*/];
                    case 25:
                        snapshotBeforeDelete = __assign({}, entity.get({ plain: true }));
                        return [4 /*yield*/, entity.destroy()];
                    case 26:
                        _f.sent();
                        if (pubSubInstance) {
                            pubSubInstance.publish("".concat(modelName, "Deleted"), (_d = {},
                                _d["".concat(modelName, "Deleted")] = entity.get(),
                                _d));
                        }
                        if (!(graphqlModelDeclaration["delete"] &&
                            'afterDelete' in graphqlModelDeclaration["delete"] &&
                            graphqlModelDeclaration["delete"].afterDelete)) return [3 /*break*/, 36];
                        hookData = { data: __assign({}, snapshotBeforeDelete) };
                        afterList = Array.isArray(graphqlModelDeclaration["delete"].afterDelete)
                            ? graphqlModelDeclaration["delete"].afterDelete
                            : [
                                graphqlModelDeclaration["delete"].afterDelete,
                            ];
                        _f.label = 27;
                    case 27:
                        _f.trys.push([27, 32, 33, 34]);
                        afterList_1 = __values(afterList), afterList_1_1 = afterList_1.next();
                        _f.label = 28;
                    case 28:
                        if (!!afterList_1_1.done) return [3 /*break*/, 31];
                        after = afterList_1_1.value;
                        afterHandle = globalPreCallback('afterDelete');
                        return [4 /*yield*/, after({
                                deletedEntity: entity,
                                source: source,
                                args: args,
                                context: context,
                                info: info
                            })];
                    case 29:
                        entity = _f.sent();
                        if (afterHandle) {
                            afterHandle();
                        }
                        _f.label = 30;
                    case 30:
                        afterList_1_1 = afterList_1.next();
                        return [3 /*break*/, 28];
                    case 31: return [3 /*break*/, 34];
                    case 32:
                        e_4_1 = _f.sent();
                        e_4 = { error: e_4_1 };
                        return [3 /*break*/, 34];
                    case 33:
                        try {
                            if (afterList_1_1 && !afterList_1_1.done && (_e = afterList_1["return"])) _e.call(afterList_1);
                        }
                        finally { if (e_4) throw e_4.error; }
                        return [7 /*endfinally*/];
                    case 34: return [4 /*yield*/, (0, callModelWebhook_1["default"])(modelName, graphqlModelDeclaration.webhooks, 'delete', context, hookData.data, callWebhook)];
                    case 35:
                        _f.sent();
                        _f.label = 36;
                    case 36: return [4 /*yield*/, (0, callModelWebhook_1["default"])(modelName, graphqlModelDeclaration.webhooks, 'delete', context, __assign({}, snapshotBeforeDelete), callWebhook)];
                    case 37:
                        _f.sent();
                        return [2 /*return*/, 1];
                }
            });
        }); }
    };
}
exports["default"] = generateMutationDelete;
