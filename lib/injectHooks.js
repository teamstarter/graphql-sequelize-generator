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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.injectHooks = void 0;
function injectListHooks(sourceDeclaration, injectFunctions) {
    var declaration = __assign({}, sourceDeclaration);
    // If the list is resolved by a custom function, we don't need to inject hooks
    if ('type' in declaration ||
        ((declaration === null || declaration === void 0 ? void 0 : declaration.list) && 'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.list))) {
        return declaration;
    }
    if (!declaration.list) {
        declaration.list = {};
    }
    else {
        declaration.list = __assign({}, declaration.list);
    }
    var beforeList = Array.isArray(declaration.list.beforeList)
        ? __spreadArray([], __read(declaration.list.beforeList), false) : declaration.list.beforeList
        ? [declaration.list.beforeList]
        : [];
    declaration.list.beforeList = injectFunctions.listBefore
        ? injectFunctions.listBefore(declaration.model, beforeList)
        : beforeList;
    var afterList = Array.isArray(declaration.list.afterList)
        ? __spreadArray([], __read(declaration.list.afterList), false) : declaration.list.afterList
        ? [declaration.list.afterList]
        : [];
    declaration.list.afterList = injectFunctions.listAfter
        ? injectFunctions.listAfter(declaration.model, afterList)
        : afterList;
    return declaration;
}
function injectUpdateHooks(sourceDeclaration, injectFunctions) {
    var _a;
    var declaration = __assign({}, sourceDeclaration);
    if ('actions' in declaration && !((_a = declaration.actions) === null || _a === void 0 ? void 0 : _a.includes('update')))
        return declaration;
    // If the update is resolved by a custom function, we don't need to inject hooks
    if ('update' in declaration &&
        (declaration === null || declaration === void 0 ? void 0 : declaration.update) &&
        'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.update)) {
        return declaration;
    }
    if ('type' in declaration ||
        ((declaration === null || declaration === void 0 ? void 0 : declaration.update) && 'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.update))) {
        return declaration;
    }
    if ('update' in declaration &&
        (declaration === null || declaration === void 0 ? void 0 : declaration.update) &&
        'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.update)) {
        return declaration;
    }
    if (!declaration.update) {
        declaration.update = {};
    }
    else {
        declaration.update = __assign({}, declaration.update);
    }
    declaration.update = declaration.update;
    var beforeUpdateFetch = Array.isArray(declaration.update.beforeUpdateFetch)
        ? __spreadArray([], __read(declaration.update.beforeUpdateFetch), false) : declaration.update.beforeUpdateFetch
        ? [declaration.update.beforeUpdateFetch]
        : [];
    declaration.update.beforeUpdateFetch = injectFunctions.updateBeforeFetch
        ? injectFunctions.updateBeforeFetch(declaration.model, beforeUpdateFetch)
        : beforeUpdateFetch;
    var beforeUpdate = Array.isArray(declaration.update.beforeUpdate)
        ? __spreadArray([], __read(declaration.update.beforeUpdate), false) : declaration.update.beforeUpdate
        ? [declaration.update.beforeUpdate]
        : [];
    declaration.update.beforeUpdate = injectFunctions.updateBefore
        ? injectFunctions.updateBefore(declaration.model, beforeUpdate)
        : beforeUpdate;
    var afterUpdate = Array.isArray(declaration.update.afterUpdate)
        ? __spreadArray([], __read(declaration.update.afterUpdate), false) : declaration.update.afterUpdate
        ? [declaration.update.afterUpdate]
        : [];
    declaration.update.afterUpdate = injectFunctions.updateAfter
        ? injectFunctions.updateAfter(declaration.model, afterUpdate)
        : afterUpdate;
    return declaration;
}
function injectCreateHooks(sourceDeclaration, injectFunctions) {
    var _a;
    var declaration = __assign({}, sourceDeclaration);
    if ('actions' in declaration && !((_a = declaration.actions) === null || _a === void 0 ? void 0 : _a.includes('create')))
        return declaration;
    // If the create is resolved by a custom function, we don't need to inject hooks
    if ('create' in declaration &&
        (declaration === null || declaration === void 0 ? void 0 : declaration.create) &&
        'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.create)) {
        return declaration;
    }
    if ('type' in declaration ||
        ((declaration === null || declaration === void 0 ? void 0 : declaration.create) && 'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.create))) {
        return declaration;
    }
    if (!declaration.create) {
        declaration.create = {};
    }
    else {
        declaration.create = __assign({}, declaration.create);
    }
    declaration.create = declaration.create;
    var beforeCreate = Array.isArray(declaration.create.beforeCreate)
        ? __spreadArray([], __read(declaration.create.beforeCreate), false) : declaration.create.beforeCreate
        ? [declaration.create.beforeCreate]
        : [];
    declaration.create.beforeCreate = injectFunctions.createBefore
        ? injectFunctions.createBefore(declaration.model, beforeCreate)
        : beforeCreate;
    var afterCreate = Array.isArray(declaration.create.afterCreate)
        ? __spreadArray([], __read(declaration.create.afterCreate), false) : declaration.create.afterCreate
        ? [declaration.create.afterCreate]
        : [];
    declaration.create.afterCreate = injectFunctions.createAfter
        ? injectFunctions.createAfter(declaration.model, afterCreate)
        : afterCreate;
    return declaration;
}
function injectDeleteHooks(sourceDeclaration, injectFunctions) {
    var _a;
    var declaration = __assign({}, sourceDeclaration);
    if ('actions' in declaration && !((_a = declaration.actions) === null || _a === void 0 ? void 0 : _a.includes('delete')))
        return declaration;
    // If the delete is resolved by a custom function, we don't need to inject hooks
    if ('delete' in declaration &&
        (declaration === null || declaration === void 0 ? void 0 : declaration["delete"]) &&
        'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration["delete"])) {
        return declaration;
    }
    if ('type' in declaration ||
        ((declaration === null || declaration === void 0 ? void 0 : declaration["delete"]) && 'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration["delete"]))) {
        return declaration;
    }
    if (!declaration["delete"]) {
        declaration["delete"] = {};
    }
    else {
        declaration["delete"] = __assign({}, declaration["delete"]);
    }
    declaration["delete"] = declaration["delete"];
    var beforeDelete = Array.isArray(declaration["delete"].beforeDelete)
        ? __spreadArray([], __read(declaration["delete"].beforeDelete), false) : declaration["delete"].beforeDelete
        ? [declaration["delete"].beforeDelete]
        : [];
    declaration["delete"].beforeDelete = injectFunctions.deleteBefore
        ? injectFunctions.deleteBefore(declaration.model, beforeDelete)
        : beforeDelete;
    var beforeDeleteFetch = Array.isArray(declaration["delete"].beforeDeleteFetch)
        ? __spreadArray([], __read(declaration["delete"].beforeDeleteFetch), false) : declaration["delete"].beforeDeleteFetch
        ? [declaration["delete"].beforeDeleteFetch]
        : [];
    declaration["delete"].beforeDeleteFetch = injectFunctions.deleteBeforeFetch
        ? injectFunctions.deleteBeforeFetch(declaration.model, beforeDeleteFetch)
        : beforeDeleteFetch;
    var afterDelete = Array.isArray(declaration["delete"].afterDelete)
        ? __spreadArray([], __read(declaration["delete"].afterDelete), false) : declaration["delete"].afterDelete
        ? [declaration["delete"].afterDelete]
        : [];
    declaration["delete"].afterDelete = injectFunctions.deleteAfter
        ? injectFunctions.deleteAfter(declaration.model, afterDelete)
        : afterDelete;
    return declaration;
}
// Injects a function that will be called with the model and the hooks
// The function can return a new list of hooks to be used instead of the original ones
function injectHooks(_a) {
    var graphqlSchemaDeclaration = _a.graphqlSchemaDeclaration, injectFunctions = _a.injectFunctions;
    var graphqlSchemaDeclarationWithHooksInjected = __assign({}, graphqlSchemaDeclaration);
    for (var key in graphqlSchemaDeclarationWithHooksInjected) {
        var declaration = graphqlSchemaDeclarationWithHooksInjected[key];
        if ('model' in declaration) {
            declaration = injectListHooks(declaration, injectFunctions);
            declaration = injectUpdateHooks(declaration, injectFunctions);
            declaration = injectCreateHooks(declaration, injectFunctions);
            declaration = injectDeleteHooks(declaration, injectFunctions);
        }
        graphqlSchemaDeclarationWithHooksInjected[key] = declaration;
    }
    return graphqlSchemaDeclarationWithHooksInjected;
}
exports.injectHooks = injectHooks;
