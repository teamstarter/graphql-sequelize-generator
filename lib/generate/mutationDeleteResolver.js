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
exports.__esModule = true;
var graphql_subscriptions_1 = require("graphql-subscriptions");
var graphql_1 = require("graphql");
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
function generateMutationDelete(modelName, graphqlModelDeclaration, models, globalPreCallback, pubSubInstance) {
    var _this = this;
    if (pubSubInstance === void 0) { pubSubInstance = new graphql_subscriptions_1.PubSub(); }
    return {
        type: graphql_1.GraphQLInt,
        description: "Delete a " + modelName,
        args: __assign({ id: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLInt) } }, (graphqlModelDeclaration["delete"] &&
            graphqlModelDeclaration["delete"].extraArg
            ? graphqlModelDeclaration["delete"].extraArg
            : {})),
        resolve: function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
            var where, beforeList, beforeList_1, beforeList_1_1, before, handle, e_1_1, beforeHandle, entity, rowDeleted, afterHandle;
            var e_1, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        where = { id: args.id };
                        if (!graphqlModelDeclaration.before) return [3 /*break*/, 8];
                        beforeList = typeof graphqlModelDeclaration.before.length !== 'undefined'
                            ? graphqlModelDeclaration.before
                            : [graphqlModelDeclaration.before];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 6, 7, 8]);
                        beforeList_1 = __values(beforeList), beforeList_1_1 = beforeList_1.next();
                        _c.label = 2;
                    case 2:
                        if (!!beforeList_1_1.done) return [3 /*break*/, 5];
                        before = beforeList_1_1.value;
                        handle = globalPreCallback('deleteGlobalBefore');
                        return [4 /*yield*/, before(args, context, info)];
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
                        if (!(graphqlModelDeclaration["delete"] &&
                            graphqlModelDeclaration["delete"].before)) return [3 /*break*/, 10];
                        beforeHandle = globalPreCallback('deleteBefore');
                        return [4 /*yield*/, graphqlModelDeclaration["delete"].before(where, source, args, context, info)];
                    case 9:
                        where = _c.sent();
                        if (beforeHandle) {
                            beforeHandle();
                        }
                        _c.label = 10;
                    case 10: return [4 /*yield*/, models[modelName].findOne({ where: where })];
                    case 11:
                        entity = _c.sent();
                        if (!entity) {
                            throw new Error(modelName + " not found.");
                        }
                        return [4 /*yield*/, graphqlModelDeclaration.model.destroy({
                                where: where
                            })]; // Returns the number of rows affected (0 or 1)
                    case 12:
                        rowDeleted = _c.sent() // Returns the number of rows affected (0 or 1)
                        ;
                        if (pubSubInstance) {
                            pubSubInstance.publish(modelName + "Deleted", (_b = {},
                                _b[modelName + "Deleted"] = entity.get(),
                                _b));
                        }
                        if (!(graphqlModelDeclaration["delete"] &&
                            graphqlModelDeclaration["delete"].after)) return [3 /*break*/, 14];
                        afterHandle = globalPreCallback('deleteAfter');
                        return [4 /*yield*/, graphqlModelDeclaration["delete"].after(entity, source, args, context, info)];
                    case 13:
                        _c.sent();
                        if (afterHandle) {
                            afterHandle();
                        }
                        _c.label = 14;
                    case 14: return [2 /*return*/, rowDeleted];
                }
            });
        }); }
    };
}
exports["default"] = generateMutationDelete;
