"use strict";
exports.__esModule = true;
var graphql_1 = require("graphql");
var graphql_subscriptions_1 = require("graphql-subscriptions");
var isGraphqlFieldDeclaration_1 = require("../isGraphqlFieldDeclaration");
var availableActions = ['create', 'update', 'delete'];
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function generateSubscriptions(graphqlSchemaDeclaration, types, pubSubInstance) {
    var fields = Object.keys(types.inputTypes).reduce(function (subscriptions, modelName) {
        if (!graphqlSchemaDeclaration[modelName]) {
            return subscriptions;
        }
        var outputType = types.outputTypes[modelName];
        var declaration = graphqlSchemaDeclaration[modelName];
        if (isGraphqlFieldDeclaration_1.isGraphqlFieldDeclaration(declaration)) {
            return subscriptions;
        }
        var subscriptionsEnabled = declaration.subscriptions || [];
        availableActions.forEach(function (action) {
            if (subscriptionsEnabled.includes(action)) {
                // ex: name = "userUpdated"
                var name_1 = "" + modelName + capitalizeFirstLetter(action) + "d";
                var configuration = declaration[action];
                subscriptions[name_1] = {
                    type: outputType,
                    args: {
                        id: { type: graphql_1.GraphQLInt }
                    },
                    subscribe: graphql_subscriptions_1.withFilter(function () { return pubSubInstance.asyncIterator(name_1); }, typeof configuration !== 'undefined' &&
                        configuration.subscriptionFilter
                        ? configuration.subscriptionFilter
                        : function () { return true; })
                };
            }
        });
        /** Subscription an be manually added, following declaration is requiered because typescript sucks. */
        var s = declaration.additionalSubscriptions;
        if (typeof s !== 'undefined') {
            Object.keys(s).map(function (key) { return (subscriptions[key] = s[key]); });
        }
        return subscriptions;
    }, {});
    if (Object.values(fields).length === 0) {
        return undefined;
    }
    return new graphql_1.GraphQLObjectType({
        name: 'Subscription',
        fields: fields
    });
}
exports["default"] = generateSubscriptions;
