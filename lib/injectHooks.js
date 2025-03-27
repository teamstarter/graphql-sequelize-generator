"use strict";
exports.__esModule = true;
exports.injectHooks = void 0;
// Injects a function that will be called with the model and the hooks
// The function can return a new list of hooks to be used instead of the original ones
function injectHooks(_a) {
    var _b, _c, _d;
    var graphqlSchemaDeclaration = _a.graphqlSchemaDeclaration, injectFunctions = _a.injectFunctions;
    for (var key in graphqlSchemaDeclaration) {
        var declaration = graphqlSchemaDeclaration[key];
        if ('model' in declaration) {
            if (!declaration.list) {
                declaration.list = {};
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
            // Initialize update configuration if it's in actions
            if ((_b = declaration.actions) === null || _b === void 0 ? void 0 : _b.includes('update')) {
                if (!declaration.update || 'type' in declaration.update) {
                    declaration.update = {};
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
            // Initialize create configuration if it's in actions
            if ((_c = declaration.actions) === null || _c === void 0 ? void 0 : _c.includes('create')) {
                if (!declaration.create || 'type' in declaration.create) {
                    declaration.create = {};
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
            // Initialize delete configuration if it's in actions
            if ((_d = declaration.actions) === null || _d === void 0 ? void 0 : _d.includes('delete')) {
                if (!declaration["delete"] || 'type' in declaration["delete"]) {
                    declaration["delete"] = {};
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
        }
    }
    return graphqlSchemaDeclaration;
}
exports.injectHooks = injectHooks;
