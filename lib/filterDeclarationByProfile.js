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
 * Keep the entries of a named map that declare the profile, stripping the
 * `profiles` key from each survivor.
 *
 * Returns `undefined` rather than `{}` when nothing survives: `generateSchema`
 * reads a present `additionalMutations` as proof that mutations exist, so an
 * empty one would build an invalid empty `Root_Mutations` type.
 */
function filterNamedEntries(entries, profileName) {
    var e_1, _a;
    if (!entries) {
        return undefined;
    }
    var kept = {};
    try {
        for (var _b = __values(Object.keys(entries)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var entry = entries[key];
            if (!entry || !entry.profiles || !entry.profiles[profileName]) {
                continue;
            }
            var profiles = entry.profiles, rest = __rest(entry, ["profiles"]);
            kept[key] = rest;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return Object.keys(kept).length > 0 ? kept : undefined;
}
/**
 * A profile may only narrow. Asking for something the endpoint does not itself
 * declare is a typo or a stale profile, and failing at build time is cheaper
 * than shipping an endpoint nobody reviewed.
 */
function assertSubset(kind, endpointKey, profileName, requested, declared) {
    var undeclared = requested.filter(function (value) { return !declared.includes(value); });
    if (undeclared.length === 0) {
        return;
    }
    throw new Error("Profile \"".concat(profileName, "\" of endpoint \"").concat(endpointKey, "\" declares ") +
        "".concat(kind, " [").concat(undeclared.join(', '), "] that the endpoint itself does not ") +
        "declare [".concat(declared.join(', '), "]. Either add them to the endpoint's ") +
        "".concat(kind, " or remove them from the profile."));
}
/** Set the key when the profile asked for something, remove it otherwise. */
function setOrDelete(entry, key, value) {
    if (value === undefined || (Array.isArray(value) && value.length === 0)) {
        delete entry[key];
        return;
    }
    entry[key] = value;
}
/**
 * Build the declaration for one named profile.
 *
 * Endpoints that do not declare the profile are dropped, which also prunes them
 * from the type graph: `injectAssociations` skips associations whose target
 * model is absent from the declaration, so a dropped endpoint is unreachable
 * through nesting too, not merely absent from the root.
 *
 * Everything is opt-in. `actions`, `subscriptions` and `webhooks` are taken
 * from the profile and default to none; `additionalMutations` and
 * `additionalSubscriptions` keep only the entries carrying the profile in their
 * own `profiles` key.
 *
 * Accepts a customMutations map as well as a schema declaration: those entries
 * carry no `model` and take the custom-endpoint branch.
 *
 * Pure: the source declaration is never mutated.
 */
function filterDeclarationByProfile(sourceDeclaration, profileName) {
    var e_2, _a;
    var filtered = {};
    try {
        for (var _b = __values(Object.keys(sourceDeclaration)), _c = _b.next(); !_c.done; _c = _b.next()) {
            var key = _c.value;
            var declaration = sourceDeclaration[key];
            var profile = declaration && declaration.profiles
                ? declaration.profiles[profileName]
                : undefined;
            if (!profile) {
                continue;
            }
            var profiles = declaration.profiles, rest = __rest(declaration
            // Custom endpoints are GraphQLFieldConfig: no model, no actions to filter.
            , ["profiles"]);
            // Custom endpoints are GraphQLFieldConfig: no model, no actions to filter.
            if (!declaration.model) {
                filtered[key] = rest;
                continue;
            }
            var profileActions = profile.actions || [];
            var profileSubscriptions = profile.subscriptions || [];
            var profileWebhooks = profile.webhooks || [];
            assertSubset('actions', key, profileName, profileActions, declaration.actions || []);
            assertSubset('subscriptions', key, profileName, profileSubscriptions, declaration.subscriptions || []);
            assertSubset('webhooks', key, profileName, profileWebhooks, declaration.webhooks || []);
            var entry = __assign(__assign({}, rest), { actions: profileActions });
            setOrDelete(entry, 'subscriptions', profileSubscriptions);
            setOrDelete(entry, 'webhooks', profileWebhooks);
            setOrDelete(entry, 'additionalMutations', filterNamedEntries(declaration.additionalMutations, profileName));
            setOrDelete(entry, 'additionalSubscriptions', filterNamedEntries(declaration.additionalSubscriptions, profileName));
            if (profile.excludeFromRoot !== undefined) {
                entry.excludeFromRoot = profile.excludeFromRoot;
            }
            filtered[key] = entry;
        }
    }
    catch (e_2_1) { e_2 = { error: e_2_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_2) throw e_2.error; }
    }
    return filtered;
}
exports.filterDeclarationByProfile = filterDeclarationByProfile;
