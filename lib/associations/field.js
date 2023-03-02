"use strict";
exports.__esModule = true;
var graphql_1 = require("graphql");
var __1 = require("..");
function generateAssociationField(relation, types, graphqlSchemaDeclaration, models, globalPreCallback, resolver) {
    if (resolver === void 0) { resolver = null; }
    var newBaseType = graphqlSchemaDeclaration &&
        // @ts-ignore
        !types[relation.target.name].associationsInjected
        ? (0, __1.injectAssociations)(types[relation.target.name], graphqlSchemaDeclaration, types, models, globalPreCallback)
        : types[relation.target.name];
    var type = relation.associationType === 'BelongsToMany' ||
        relation.associationType === 'HasMany'
        ? new graphql_1.GraphQLList(newBaseType)
        : newBaseType;
    var field = {
        type: type,
        isDeprecated: false,
        associationsInjected: true,
        name: relation.as,
        args: [
            {
                // An arg with the key order will automatically be converted to a order on the target
                name: 'order',
                type: graphql_1.GraphQLString
            },
        ]
    };
    if (relation.associationType === 'HasMany') {
        // Limit and offset will only work for HasMany relation ship
        // Having the limit on the include will trigger a "Only HasMany associations support include.separate" error.
        // While sequelize N:M associations are not supported with hasMany. So BelongsToMany relationships
        // cannot be limited in a subquery. If you want to query them, make a custom resolver, or create a view.
        field.args.push({ name: 'limit', type: graphql_1.GraphQLInt });
        field.args.push({ name: 'offset', type: graphql_1.GraphQLInt });
    }
    if (resolver) {
        // @ts-ignore
        field.resolve = resolver;
    }
    // @ts-ignore
    return field;
}
exports["default"] = generateAssociationField;
