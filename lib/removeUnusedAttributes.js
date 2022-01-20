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
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
exports.__esModule = true;
var graphql_sequelize_1 = require("graphql-sequelize");
/**
 * This functions returns the findOptions for a findAll/One with only the attributes required in the info.
 * By default all attributes are always fetched.
 *
 * @param {*} findOptions
 * @param {*} info
 * @param {Array<string>} keep An array of all the attributes to keep
 */
function removeUnusedAttributes(findOptions, info, currentModel, models, keep) {
    if (keep === void 0) { keep = []; }
    var fieldNodes = info.fieldNodes;
    if (!fieldNodes) {
        return findOptions;
    }
    var ast = graphql_sequelize_1.simplifyAST(fieldNodes[0], info);
    var linkFields = [];
    /**
     * This reduce is made to add the attributes required to fetch
     * sub objects. This part of the code not responsible for the parents.
     * For exemple if the "id" of car is not selected, it will not be handled here
     * but on the next step.
     *
     * Example :
     * user {
     *   id
     *   // carId
     *   car {
     *     id
     *   }
     * }
     *
     * If carId is not asked in the GraphQL query, we must still include it so
     * that the reconcilier can match the car with the user.
     *
     */
    var attributes = Object.keys(ast.fields).filter(function (attribute) {
        // The typename field is a key metadata and must always be returned if asked
        if (attribute === '__typename') {
            return false;
        }
        // We check if the field is a leef or an entity
        if (Object.keys(ast.fields[attribute].fields).length > 0) {
            // If the field is an entity we check if we find the association
            if (models[currentModel.name].associations[attribute]) {
                var association = models[currentModel.name].associations[attribute];
                // If so we add the foreignKey to the list of fields to fetch.
                // Without it the sub-entities will not be fetched
                if (['HasOne', 'HasMany', 'BelongsToMany'].includes(association.associationType)) {
                    linkFields.push(association.sourceKey);
                }
                else if (['BelongsTo'].includes(association.associationType)) {
                    linkFields.push(association.foreignKey);
                }
                else {
                    throw new Error("removeUnusedAttributes does not support his association: " + association.associationType + " for entity " + currentModel.name + "/" + association.as);
                }
            }
            // In any case, the entity name as attribute is not returned.
            return false;
        }
        return true;
    });
    /**
     * This part of the code is in charge of adding information required to be fetched
     * to match with the parent object.
     *
     * Example :
     * user {
     *   id
     *   cars {
     *     id
     *     // userId
     *   }
     * }
     *
     * If userId is not asked in the GraphQL query, we must still include it so
     * that the reconcilier can match the cars with the user.
     *
     */
    var parentModelReferenceAttributes = [];
    // The relation can be direct
    if (currentModel.associations[info.parentType.name]) {
        if (currentModel.associations[info.parentType.name].associationType ===
            'BelongsTo') {
            parentModelReferenceAttributes.push(currentModel.associations[info.parentType.name].foreignKey);
        }
        // @todo add more cases as they are used
    }
    // Or indirect
    if (models[info.parentType.name] &&
        models[info.parentType.name].associations[info.fieldName]) {
        if (['HasMany', 'HasOne'].includes(models[info.parentType.name].associations[info.fieldName]
            .associationType)) {
            parentModelReferenceAttributes.push(models[info.parentType.name].associations[info.fieldName].foreignKey);
        }
        // @todo add more cases as they are used
    }
    return __assign(__assign({}, findOptions), { attributes: __spread(new Set(__spread(attributes, linkFields, parentModelReferenceAttributes, keep))) });
}
exports["default"] = removeUnusedAttributes;
