"use strict";
exports.__esModule = true;
exports.isGraphqlFieldDeclaration = void 0;
function isGraphqlFieldDeclaration(declaration) {
    return declaration.type !== undefined;
}
exports.isGraphqlFieldDeclaration = isGraphqlFieldDeclaration;
