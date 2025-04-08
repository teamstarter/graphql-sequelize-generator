"use strict";
exports.__esModule = true;
exports.injectHooks = void 0;
function injectListHooks(declaration, injectFunctions) {
    // If the list is resolved by a custom function, we don't need to inject hooks
    if ('type' in declaration ||
        ((declaration === null || declaration === void 0 ? void 0 : declaration.list) && 'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.list))) {
        return;
    }
    if (!declaration.list) {
        declaration.list = {};
    }
    var beforeList = Array.isArray(declaration.list.beforeList)
        ? declaration.list.beforeList
        : declaration.list.beforeList
            ? [declaration.list.beforeList]
            : [];
    declaration.list.beforeList = injectFunctions.listBefore
        ? injectFunctions.listBefore(declaration.model, beforeList)
        : beforeList;
    var afterList = Array.isArray(declaration.list.afterList)
        ? declaration.list.afterList
        : declaration.list.afterList
            ? [declaration.list.afterList]
            : [];
    declaration.list.afterList = injectFunctions.listAfter
        ? injectFunctions.listAfter(declaration.model, afterList)
        : afterList;
}
function injectUpdateHooks(declaration, injectFunctions) {
    var _a;
    if ('actions' in declaration && !((_a = declaration.actions) === null || _a === void 0 ? void 0 : _a.includes('update')))
        return;
    // If the update is resolved by a custom function, we don't need to inject hooks
    if ('update' in declaration &&
        (declaration === null || declaration === void 0 ? void 0 : declaration.update) &&
        'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.update)) {
        return;
    }
    if ('type' in declaration ||
        ((declaration === null || declaration === void 0 ? void 0 : declaration.update) && 'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.update))) {
        return;
    }
    if ('update' in declaration &&
        (declaration === null || declaration === void 0 ? void 0 : declaration.update) &&
        'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.update)) {
        return;
    }
    if (!declaration.update) {
        declaration.update = {};
    }
    declaration.update = declaration.update;
    var beforeUpdateFetch = Array.isArray(declaration.update.beforeUpdateFetch)
        ? declaration.update.beforeUpdateFetch
        : declaration.update.beforeUpdateFetch
            ? [declaration.update.beforeUpdateFetch]
            : [];
    declaration.update.beforeUpdateFetch = injectFunctions.updateBeforeFetch
        ? injectFunctions.updateBeforeFetch(declaration.model, beforeUpdateFetch)
        : beforeUpdateFetch;
    var beforeUpdate = Array.isArray(declaration.update.beforeUpdate)
        ? declaration.update.beforeUpdate
        : declaration.update.beforeUpdate
            ? [declaration.update.beforeUpdate]
            : [];
    declaration.update.beforeUpdate = injectFunctions.updateBefore
        ? injectFunctions.updateBefore(declaration.model, beforeUpdate)
        : beforeUpdate;
    var afterUpdate = Array.isArray(declaration.update.afterUpdate)
        ? declaration.update.afterUpdate
        : declaration.update.afterUpdate
            ? [declaration.update.afterUpdate]
            : [];
    declaration.update.afterUpdate = injectFunctions.updateAfter
        ? injectFunctions.updateAfter(declaration.model, afterUpdate)
        : afterUpdate;
}
function injectCreateHooks(declaration, injectFunctions) {
    var _a;
    if ('actions' in declaration && !((_a = declaration.actions) === null || _a === void 0 ? void 0 : _a.includes('create')))
        return;
    // If the create is resolved by a custom function, we don't need to inject hooks
    if ('create' in declaration &&
        (declaration === null || declaration === void 0 ? void 0 : declaration.create) &&
        'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.create)) {
        return;
    }
    if ('type' in declaration ||
        ((declaration === null || declaration === void 0 ? void 0 : declaration.create) && 'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration.create))) {
        return;
    }
    if (!declaration.create) {
        declaration.create = {};
    }
    declaration.create = declaration.create;
    var beforeCreate = Array.isArray(declaration.create.beforeCreate)
        ? declaration.create.beforeCreate
        : declaration.create.beforeCreate
            ? [declaration.create.beforeCreate]
            : [];
    declaration.create.beforeCreate = injectFunctions.createBefore
        ? injectFunctions.createBefore(declaration.model, beforeCreate)
        : beforeCreate;
    var afterCreate = Array.isArray(declaration.create.afterCreate)
        ? declaration.create.afterCreate
        : declaration.create.afterCreate
            ? [declaration.create.afterCreate]
            : [];
    declaration.create.afterCreate = injectFunctions.createAfter
        ? injectFunctions.createAfter(declaration.model, afterCreate)
        : afterCreate;
}
function injectDeleteHooks(declaration, injectFunctions) {
    var _a;
    if ('actions' in declaration && !((_a = declaration.actions) === null || _a === void 0 ? void 0 : _a.includes('delete')))
        return;
    // If the delete is resolved by a custom function, we don't need to inject hooks
    if ('delete' in declaration &&
        (declaration === null || declaration === void 0 ? void 0 : declaration["delete"]) &&
        'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration["delete"])) {
        return;
    }
    if ('type' in declaration ||
        ((declaration === null || declaration === void 0 ? void 0 : declaration["delete"]) && 'resolve' in (declaration === null || declaration === void 0 ? void 0 : declaration["delete"]))) {
        return;
    }
    if (!declaration["delete"]) {
        declaration["delete"] = {};
    }
    declaration["delete"] = declaration["delete"];
    var beforeDelete = Array.isArray(declaration["delete"].beforeDelete)
        ? declaration["delete"].beforeDelete
        : declaration["delete"].beforeDelete
            ? [declaration["delete"].beforeDelete]
            : [];
    declaration["delete"].beforeDelete = injectFunctions.deleteBefore
        ? injectFunctions.deleteBefore(declaration.model, beforeDelete)
        : beforeDelete;
    var beforeDeleteFetch = Array.isArray(declaration["delete"].beforeDeleteFetch)
        ? declaration["delete"].beforeDeleteFetch
        : declaration["delete"].beforeDeleteFetch
            ? [declaration["delete"].beforeDeleteFetch]
            : [];
    declaration["delete"].beforeDeleteFetch = injectFunctions.deleteBeforeFetch
        ? injectFunctions.deleteBeforeFetch(declaration.model, beforeDeleteFetch)
        : beforeDeleteFetch;
    var afterDelete = Array.isArray(declaration["delete"].afterDelete)
        ? declaration["delete"].afterDelete
        : declaration["delete"].afterDelete
            ? [declaration["delete"].afterDelete]
            : [];
    declaration["delete"].afterDelete = injectFunctions.deleteAfter
        ? injectFunctions.deleteAfter(declaration.model, afterDelete)
        : afterDelete;
}
// Injects a function that will be called with the model and the hooks
// The function can return a new list of hooks to be used instead of the original ones
function injectHooks(_a) {
    var graphqlSchemaDeclaration = _a.graphqlSchemaDeclaration, injectFunctions = _a.injectFunctions;
    for (var key in graphqlSchemaDeclaration) {
        var declaration = graphqlSchemaDeclaration[key];
        if ('model' in declaration) {
            injectListHooks(declaration, injectFunctions);
            injectUpdateHooks(declaration, injectFunctions);
            injectCreateHooks(declaration, injectFunctions);
            injectDeleteHooks(declaration, injectFunctions);
        }
    }
    return graphqlSchemaDeclaration;
}
exports.injectHooks = injectHooks;
