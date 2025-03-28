"use strict";
exports.__esModule = true;
exports.injectHooks = void 0;
function injectListHooks(declaration, injectFunctions) {
    if (!declaration.list) {
        declaration.list = {};
    }
    // If the list is resolved by a custom function, we don't need to inject hooks
    if (declaration.list.resolve) {
        return;
    }
    var beforeList = Array.isArray(declaration.list.before)
        ? declaration.list.before
        : declaration.list.before
            ? [declaration.list.before]
            : [];
    declaration.list.before = injectFunctions.listBefore
        ? injectFunctions.listBefore(declaration.model, beforeList)
        : beforeList;
    var afterList = Array.isArray(declaration.list.after)
        ? declaration.list.after
        : declaration.list.after
            ? [declaration.list.after]
            : [];
    declaration.list.after = injectFunctions.listAfter
        ? injectFunctions.listAfter(declaration.model, afterList)
        : afterList;
}
function injectUpdateHooks(declaration, injectFunctions) {
    var _a;
    if (!((_a = declaration.actions) === null || _a === void 0 ? void 0 : _a.includes('update')))
        return;
    if (!declaration.update || 'type' in declaration.update) {
        declaration.update = {};
    }
    // If the update is resolved by a custom function, we don't need to inject hooks
    if (declaration.update.resolve) {
        return;
    }
    var beforeUpdate = Array.isArray(declaration.update.before)
        ? declaration.update.before
        : declaration.update.before
            ? [declaration.update.before]
            : [];
    declaration.update.before = injectFunctions.updateBefore
        ? injectFunctions.updateBefore(declaration.model, beforeUpdate)
        : beforeUpdate;
    var afterUpdate = Array.isArray(declaration.update.after)
        ? declaration.update.after
        : declaration.update.after
            ? [declaration.update.after]
            : [];
    declaration.update.after = injectFunctions.updateAfter
        ? injectFunctions.updateAfter(declaration.model, afterUpdate)
        : afterUpdate;
}
function injectCreateHooks(declaration, injectFunctions) {
    var _a;
    if (!((_a = declaration.actions) === null || _a === void 0 ? void 0 : _a.includes('create')))
        return;
    if (!declaration.create || 'type' in declaration.create) {
        declaration.create = {};
    }
    // If the create is resolved by a custom function, we don't need to inject hooks
    if (declaration.list.create) {
        return;
    }
    var beforeCreate = Array.isArray(declaration.create.before)
        ? declaration.create.before
        : declaration.create.before
            ? [declaration.create.before]
            : [];
    declaration.create.before = injectFunctions.createBefore
        ? injectFunctions.createBefore(declaration.model, beforeCreate)
        : beforeCreate;
    var afterCreate = Array.isArray(declaration.create.after)
        ? declaration.create.after
        : declaration.create.after
            ? [declaration.create.after]
            : [];
    declaration.create.after = injectFunctions.createAfter
        ? injectFunctions.createAfter(declaration.model, afterCreate)
        : afterCreate;
}
function injectDeleteHooks(declaration, injectFunctions) {
    var _a;
    if (!((_a = declaration.actions) === null || _a === void 0 ? void 0 : _a.includes('delete')))
        return;
    if (!declaration["delete"] || 'type' in declaration["delete"]) {
        declaration["delete"] = {};
    }
    // If the delete is resolved by a custom function, we don't need to inject hooks
    if (declaration["delete"].resolve) {
        return;
    }
    var beforeDelete = Array.isArray(declaration["delete"].before)
        ? declaration["delete"].before
        : declaration["delete"].before
            ? [declaration["delete"].before]
            : [];
    declaration["delete"].before = injectFunctions.deleteBefore
        ? injectFunctions.deleteBefore(declaration.model, beforeDelete)
        : beforeDelete;
    var afterDelete = Array.isArray(declaration["delete"].after)
        ? declaration["delete"].after
        : declaration["delete"].after
            ? [declaration["delete"].after]
            : [];
    declaration["delete"].after = injectFunctions.deleteAfter
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
