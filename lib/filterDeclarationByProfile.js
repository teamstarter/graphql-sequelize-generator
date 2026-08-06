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
exports.__esModule = true;
exports.filterDeclarationByProfile = void 0;
/**
 * Keys describing write surface or live connections. A profile is a restricted
 * view, and there is no vocabulary yet for restricting these individually, so
 * they are dropped wholesale rather than half-filtered.
 */
var DROPPED_IN_PROFILES = [
    'additionalMutations',
    'additionalSubscriptions',
    'subscriptions',
    'webhooks',
];
/**
 * Build the declaration for one named profile.
 *
 * Endpoints that do not declare the profile are dropped, which also prunes them
 * from the type graph: `injectAssociations` skips associations whose target
 * model is absent from the declaration, so a dropped endpoint is unreachable
 * through nesting too, not merely absent from the root.
 *
 * Accepts a customMutations map as well as a schema declaration: those entries
 * carry no `model` and take the custom-endpoint branch.
 *
 * Pure: the source declaration is never mutated.
 */
function filterDeclarationByProfile(sourceDeclaration, profileName) {
    var e_1, _a;
    var filtered = {};
    var _loop_1 = function (key) {
        var e_2, _d;
        var declaration = sourceDeclaration[key];
        var profile = declaration && declaration.profiles
            ? declaration.profiles[profileName]
            : undefined;
        if (!profile) {
            return "continue";
        }
        var profiles = declaration.profiles, rest = __rest(declaration
        // Custom endpoints are GraphQLFieldConfig: no model, no actions to filter.
        , ["profiles"]);
        // Custom endpoints are GraphQLFieldConfig: no model, no actions to filter.
        if (!declaration.model) {
            filtered[key] = rest;
            return "continue";
        }
        var declaredActions = declaration.actions || [];
        var profileActions = profile.actions || [];
        var undeclared = profileActions.filter(function (action) { return !declaredActions.includes(action); });
        if (undeclared.length > 0) {
            throw new Error("Profile \"".concat(profileName, "\" of endpoint \"").concat(key, "\" declares action(s) ") +
                "[".concat(undeclared.join(', '), "] that the endpoint itself does not ") +
                "declare [".concat(declaredActions.join(', '), "]. Either add them to the ") +
                "endpoint's actions or remove them from the profile.");
        }
        var entry = __assign(__assign({}, rest), { actions: profileActions });
        if (profile.excludeFromRoot !== undefined) {
            entry.excludeFromRoot = profile.excludeFromRoot;
        }
        try {
            for (var DROPPED_IN_PROFILES_1 = (e_2 = void 0, __values(DROPPED_IN_PROFILES)), DROPPED_IN_PROFILES_1_1 = DROPPED_IN_PROFILES_1.next(); !DROPPED_IN_PROFILES_1_1.done; DROPPED_IN_PROFILES_1_1 = DROPPED_IN_PROFILES_1.next()) {
                var dropped = DROPPED_IN_PROFILES_1_1.value;
                delete entry[dropped];
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (DROPPED_IN_PROFILES_1_1 && !DROPPED_IN_PROFILES_1_1.done && (_d = DROPPED_IN_PROFILES_1["return"])) _d.call(DROPPED_IN_PROFILES_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
        filtered[key] = entry;
    };
    try {
        for (var _b = __values(Object.keys(sourceDeclaration)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            _loop_1(key);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return filtered;
}
exports.filterDeclarationByProfile = filterDeclarationByProfile;
