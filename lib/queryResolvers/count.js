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
exports.__esModule = true;
var graphql_sequelize_1 = require("graphql-sequelize");
function countResolver(model, schemaDeclaration, globalPreCallback) {
    var _this = this;
    var countResolver = schemaDeclaration.count && schemaDeclaration.count.resolver
        ? schemaDeclaration.count.resolver
        : undefined;
    if (countResolver) {
        return countResolver;
    }
    var listBefore = schemaDeclaration.list && schemaDeclaration.list.before
        ? schemaDeclaration.list.before
        : undefined;
    // Count uses the same before function as the list, except if specified otherwise
    var countBefore = schemaDeclaration.count && schemaDeclaration.count.before
        ? schemaDeclaration.count.before
        : listBefore;
    return function (source, args, context, info) { return __awaiter(_this, void 0, void 0, function () {
        var beforeList, beforeList_1, beforeList_1_1, before, handle, e_1_1, findOptions, beforeList, beforeList_2, beforeList_2_1, before, handle, resultBefore, e_2_1, count, afterList, modifiedCount, afterList_1, afterList_1_1, after, handle, e_3_1;
        var e_1, _a, e_2, _b, e_3, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    if (!schemaDeclaration.before) return [3 /*break*/, 8];
                    beforeList = Array.isArray(schemaDeclaration.before)
                        ? schemaDeclaration.before
                        : [schemaDeclaration.before];
                    _d.label = 1;
                case 1:
                    _d.trys.push([1, 6, 7, 8]);
                    beforeList_1 = __values(beforeList), beforeList_1_1 = beforeList_1.next();
                    _d.label = 2;
                case 2:
                    if (!!beforeList_1_1.done) return [3 /*break*/, 5];
                    before = beforeList_1_1.value;
                    handle = globalPreCallback('listGlobalBefore');
                    return [4 /*yield*/, before({ args: args, context: context, info: info })];
                case 3:
                    _d.sent();
                    if (handle) {
                        handle();
                    }
                    _d.label = 4;
                case 4:
                    beforeList_1_1 = beforeList_1.next();
                    return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 8];
                case 6:
                    e_1_1 = _d.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 8];
                case 7:
                    try {
                        if (beforeList_1_1 && !beforeList_1_1.done && (_a = beforeList_1["return"])) _a.call(beforeList_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 8:
                    findOptions = graphql_sequelize_1.argsToFindOptions["default"](args, Object.keys(model.getAttributes()));
                    if (!countBefore) return [3 /*break*/, 16];
                    beforeList = Array.isArray(countBefore)
                        ? countBefore
                        : [countBefore];
                    _d.label = 9;
                case 9:
                    _d.trys.push([9, 14, 15, 16]);
                    beforeList_2 = __values(beforeList), beforeList_2_1 = beforeList_2.next();
                    _d.label = 10;
                case 10:
                    if (!!beforeList_2_1.done) return [3 /*break*/, 13];
                    before = beforeList_2_1.value;
                    handle = globalPreCallback('countBefore');
                    return [4 /*yield*/, before({
                            findOptions: findOptions,
                            args: args,
                            context: context,
                            info: info
                        })];
                case 11:
                    resultBefore = _d.sent();
                    if (!resultBefore) {
                        throw new Error('The before hook of the count endpoint must return a value.');
                    }
                    findOptions = resultBefore;
                    if (handle) {
                        handle();
                    }
                    _d.label = 12;
                case 12:
                    beforeList_2_1 = beforeList_2.next();
                    return [3 /*break*/, 10];
                case 13: return [3 /*break*/, 16];
                case 14:
                    e_2_1 = _d.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 16];
                case 15:
                    try {
                        if (beforeList_2_1 && !beforeList_2_1.done && (_b = beforeList_2["return"])) _b.call(beforeList_2);
                    }
                    finally { if (e_2) throw e_2.error; }
                    return [7 /*endfinally*/];
                case 16: return [4 /*yield*/, model.count(findOptions)];
                case 17:
                    count = _d.sent();
                    if (!(schemaDeclaration.count && schemaDeclaration.count.after)) return [3 /*break*/, 26];
                    afterList = Array.isArray(schemaDeclaration.count.after)
                        ? schemaDeclaration.count.after
                        : [schemaDeclaration.count.after];
                    modifiedCount = count;
                    _d.label = 18;
                case 18:
                    _d.trys.push([18, 23, 24, 25]);
                    afterList_1 = __values(afterList), afterList_1_1 = afterList_1.next();
                    _d.label = 19;
                case 19:
                    if (!!afterList_1_1.done) return [3 /*break*/, 22];
                    after = afterList_1_1.value;
                    handle = globalPreCallback('countAfter');
                    return [4 /*yield*/, after({
                            result: modifiedCount,
                            args: args,
                            context: context,
                            info: info
                        })];
                case 20:
                    modifiedCount = _d.sent();
                    if (handle) {
                        handle();
                    }
                    _d.label = 21;
                case 21:
                    afterList_1_1 = afterList_1.next();
                    return [3 /*break*/, 19];
                case 22: return [3 /*break*/, 25];
                case 23:
                    e_3_1 = _d.sent();
                    e_3 = { error: e_3_1 };
                    return [3 /*break*/, 25];
                case 24:
                    try {
                        if (afterList_1_1 && !afterList_1_1.done && (_c = afterList_1["return"])) _c.call(afterList_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                    return [7 /*endfinally*/];
                case 25: return [2 /*return*/, modifiedCount];
                case 26: return [2 /*return*/, count];
            }
        });
    }); };
}
exports["default"] = countResolver;
