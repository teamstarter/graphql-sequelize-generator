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
exports.validateTransactionDeclaration = exports.getTransactionOptions = exports.isTransactional = void 0;
/**
 * Whether the action runs inside a transaction.
 *
 * The per-action flag (`create.transactional`, `update.transactional`,
 * `delete.transactional`) wins over the declaration-level one. Both default
 * to `false`: a hook written without a transaction in mind must not be moved
 * inside one silently.
 */
function isTransactional(graphqlModelDeclaration, action) {
    var actionDeclaration = graphqlModelDeclaration[action];
    if (actionDeclaration &&
        typeof actionDeclaration.transactional === 'boolean') {
        return actionDeclaration.transactional;
    }
    return graphqlModelDeclaration.transactional === true;
}
exports.isTransactional = isTransactional;
/**
 * The options handed to `sequelize.transaction(...)`, per-action first.
 */
function getTransactionOptions(graphqlModelDeclaration, action) {
    var actionDeclaration = graphqlModelDeclaration[action];
    if (actionDeclaration && actionDeclaration.transactionOptions) {
        return actionDeclaration.transactionOptions;
    }
    return graphqlModelDeclaration.transactionOptions || {};
}
exports.getTransactionOptions = getTransactionOptions;
/**
 * Rejects, at schema build time, a declaration whose transaction settings
 * cannot mean what their author intended. Called once per generated action.
 *
 * - `transactional` must be a boolean when present (a string 'true' would be
 *   silently falsy and the hooks would never get a transaction).
 * - `transactionOptions` without `transactional: true` is never read: either
 *   the flag is missing or the options are on the wrong level.
 */
function validateTransactionDeclaration(modelName, graphqlModelDeclaration, action) {
    var e_1, _a;
    var actionDeclaration = graphqlModelDeclaration[action] || {};
    var where = function (key, level) {
        return level === 'action' ? "".concat(modelName, ".").concat(action, ".").concat(key) : "".concat(modelName, ".").concat(key);
    };
    try {
        for (var _b = __values([
            [graphqlModelDeclaration.transactional, 'declaration'],
            [actionDeclaration.transactional, 'action'],
        ]), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), value = _d[0], level = _d[1];
            if (typeof value !== 'undefined' && typeof value !== 'boolean') {
                throw new Error("".concat(where('transactional', level), " must be a boolean, got ").concat(JSON.stringify(value), "."));
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    if (actionDeclaration.transactionOptions &&
        !isTransactional(graphqlModelDeclaration, action)) {
        throw new Error("".concat(where('transactionOptions', 'action'), " is set but the ").concat(action, " mutation is not transactional: add `transactional: true` next to it."));
    }
    var anyActionTransactional = ['create', 'update', 'delete'].some(function (a) { return isTransactional(graphqlModelDeclaration, a); });
    if (graphqlModelDeclaration.transactionOptions && !anyActionTransactional) {
        throw new Error("".concat(where('transactionOptions', 'declaration'), " is set but no mutation of ").concat(modelName, " is transactional: add `transactional: true` to the declaration or to one of its actions."));
    }
}
exports.validateTransactionDeclaration = validateTransactionDeclaration;
/**
 * Runs the body of a generated mutation, inside one transaction when the
 * declaration asks for it and bare otherwise.
 *
 * `work` receives the transaction (`undefined` when not transactional) and
 * must pass it to every hook and every query it runs. Any throw rolls the
 * transaction back and is rethrown as is: GSG does not retry. A caller who
 * needs retries on serialization failures wraps its own service call inside
 * the hook, with the transaction it is given.
 */
function runMutation(model, graphqlModelDeclaration, action, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
work) {
    return __awaiter(this, void 0, void 0, function () {
        var outcome, sequelize;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!isTransactional(graphqlModelDeclaration, action)) return [3 /*break*/, 2];
                    sequelize = model.sequelize;
                    if (!sequelize) {
                        throw new Error("".concat(model.name, ": a transactional mutation needs a model bound to a Sequelize instance."));
                    }
                    return [4 /*yield*/, sequelize.transaction(getTransactionOptions(graphqlModelDeclaration, action), work)];
                case 1:
                    outcome = _a.sent();
                    return [3 /*break*/, 4];
                case 2: return [4 /*yield*/, work(undefined)];
                case 3:
                    outcome = _a.sent();
                    _a.label = 4;
                case 4:
                    if (!outcome.afterCommit) return [3 /*break*/, 6];
                    return [4 /*yield*/, outcome.afterCommit()];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [2 /*return*/, outcome.result];
            }
        });
    });
}
exports["default"] = runMutation;
