"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var axios_1 = __importDefault(require("axios"));
var synchronizeWithIntegromat_1 = require("../synchronizeWithIntegromat");
function addUpdateModule(models, modelName, attributes, token) {
    var variable = {};
    var returnAttrinutes = '';
    attributes.forEach(function (attribute) {
        if (models[modelName].rawAttributes[attribute].type.constructor.key !==
            'VIRTUAL') {
            variable[attribute] = "{{" + attribute + "}}";
        }
        returnAttrinutes += attribute + "\n    ";
    });
    var data = JSON.stringify({
        name: "update" + synchronizeWithIntegromat_1.capitalize(modelName),
        label: "Update " + synchronizeWithIntegromat_1.capitalize(modelName),
        type_id: 4,
        crud: 'update',
        description: "The update endpoint for the " + synchronizeWithIntegromat_1.capitalize(modelName)
    });
    var config = {
        method: 'post',
        url: "https://api.integromat.com/v1/app/test-app-894954/1/module",
        headers: {
            Authorization: "Token " + token,
            'Content-Type': 'application/json',
            'x-imt-apps-sdk-version': '1.0.0'
        },
        data: data
    };
    axios_1["default"](config)
        .then(function (response) {
        var _a;
        console.log(JSON.stringify(response.data));
        var queryString = JSON.stringify({
            url: '/platform/graphql',
            method: 'POST',
            qs: {},
            body: {
                operationName: "update" + synchronizeWithIntegromat_1.capitalize(modelName),
                variables: (_a = {},
                    _a[modelName] = variable,
                    _a),
                query: "mutation update" + synchronizeWithIntegromat_1.capitalize(modelName) + "($" + modelName + ": " + modelName + "Input!) {\n  " + modelName + "Update(" + modelName + ": $" + modelName + ") {\n    " + returnAttrinutes + "__typename\n  }\n}\n"
            },
            headers: {
                authorization: '{{connection.token}}'
            },
            response: {
                output: '{{body}}'
            }
        });
        var configApi = {
            method: 'put',
            url: "https://api.integromat.com/v1/app/test-app-894954/1/module/update" + synchronizeWithIntegromat_1.capitalize(modelName) + "/api",
            headers: {
                Authorization: "Token " + token,
                'x-imt-apps-sdk-version': '1.0.0',
                'Content-Type': 'application/jsonc'
            },
            data: queryString
        };
        axios_1["default"](configApi)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
        })["catch"](function (error) {
            console.log(error);
        });
        var parameters = Object.keys(variable).map(function (attribute) {
            var attributeObject = models[modelName].rawAttributes[attribute];
            var parameter = {
                name: attribute,
                type: models[modelName].rawAttributes[attribute].type.constructor.key,
                label: synchronizeWithIntegromat_1.capitalize(attribute),
                required: attribute === 'id'
                    ? true
                    : !models[modelName].rawAttributes[attribute].allowNull
            };
            if (attributeObject.validate && attributeObject.validate.isIn) {
                parameter['type'] = 'select';
                parameter['options'] = attributeObject.validate.isIn[0].map(function (valid) { return ({
                    label: String(valid),
                    value: valid
                }); });
            }
            return parameter;
        });
        var configExpect = {
            method: 'put',
            url: "https://api.integromat.com/v1/app/test-app-894954/1/module/update" + synchronizeWithIntegromat_1.capitalize(modelName) + "/expect",
            headers: {
                Authorization: "Token " + token,
                'x-imt-apps-sdk-version': '1.0.0',
                'Content-Type': 'application/jsonc'
            },
            data: JSON.stringify(parameters)
        };
        axios_1["default"](configExpect)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
        })["catch"](function (error) {
            console.log(error);
        });
    })["catch"](function (error) {
        console.log(error);
    });
}
exports["default"] = addUpdateModule;
