"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGraphqlFieldDeclaration = isGraphqlFieldDeclaration;
function isGraphqlFieldDeclaration(declaration) {
    return declaration.type !== undefined;
}
