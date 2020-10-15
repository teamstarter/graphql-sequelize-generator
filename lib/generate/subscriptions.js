"use strict";
exports.__esModule = true;
var graphql_1 = require("graphql");
var graphql_subscriptions_1 = require("graphql-subscriptions");
var availableActions = ['create', 'update', 'delete'];
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function generateSubscriptions(graphqlSchemaDeclaration, types, pubSubInstance) {
    var fields = Object.keys(types.inputTypes).reduce(function (subscriptions, modelName) {
        var outputType = types.outputTypes[modelName];
        if (!graphqlSchemaDeclaration[modelName]) {
            return subscriptions;
        }
        var subscriptionsEnabled = typeof graphqlSchemaDeclaration[modelName].subscriptions !== 'undefined'
            ? graphqlSchemaDeclaration[modelName].subscriptions
            : [];
        availableActions.forEach(function (action) {
            if (subscriptionsEnabled.includes(action)) {
                // ex: name = "userUpdated"
                var name_1 = "" + modelName + capitalizeFirstLetter(action) + "d";
                subscriptions[name_1] = {
                    type: outputType,
                    args: {
                        id: { type: graphql_1.GraphQLInt }
                    },
                    subscribe: graphql_subscriptions_1.withFilter(function () { return pubSubInstance.asyncIterator(name_1); }, graphqlSchemaDeclaration[modelName][action] &&
                        graphqlSchemaDeclaration[modelName][action].subscriptionFilter
                        ? graphqlSchemaDeclaration[modelName][action].subscriptionFilter
                        : function () { return true; })
                };
            }
        });
        /** Subscription an be manually added */
        if (graphqlSchemaDeclaration[modelName].additionalSubscriptions) {
            Object.keys(graphqlSchemaDeclaration[modelName].additionalSubscriptions).map(function (key) {
                return (subscriptions[key] =
                    graphqlSchemaDeclaration[modelName].additionalSubscriptions[key]);
            });
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
