"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var axios_1 = __importDefault(require("axios"));
var synchronizeWithIntegromat_1 = require("../synchronizeWithIntegromat");
function addUpdateModule(models, modelName, attributes, token, appName) {
    var variable = {};
    var returnAttrinutes = '';
    attributes.forEach(function (attribute) {
        if (models[modelName].rawAttributes[attribute].type.constructor.key !==
            'VIRTUAL') {
            variable[attribute] = "{{".concat(attribute, "}}");
        }
        returnAttrinutes += "".concat(attribute, "\n    ");
    });
    var data = JSON.stringify({
        name: "update".concat((0, synchronizeWithIntegromat_1.capitalize)(modelName)),
        label: "Update ".concat((0, synchronizeWithIntegromat_1.capitalize)(modelName)),
        type_id: 4,
        crud: 'update',
        description: "The update endpoint for the ".concat((0, synchronizeWithIntegromat_1.capitalize)(modelName))
    });
    var config = {
        method: 'post',
        url: "https://api.integromat.com/v1/app/".concat(appName, "/1/module"),
        headers: {
            Authorization: "Token ".concat(token),
            'Content-Type': 'application/json',
            'x-imt-apps-sdk-version': '1.0.0'
        },
        data: data
    };
    (0, axios_1["default"])(config)
        .then(function (response) {
        var _a;
        console.log(JSON.stringify(response));
        var queryString = JSON.stringify({
            url: '/platform/graphql',
            method: 'POST',
            qs: {},
            body: {
                operationName: "update".concat((0, synchronizeWithIntegromat_1.capitalize)(modelName)),
                variables: (_a = {},
                    _a[modelName] = variable,
                    _a),
                query: "mutation update".concat((0, synchronizeWithIntegromat_1.capitalize)(modelName), "($").concat(modelName, ": ").concat(modelName, "Input!) {\n  ").concat(modelName, "Update(").concat(modelName, ": $").concat(modelName, ") {\n    ").concat(returnAttrinutes, "__typename\n  }\n}\n")
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
            url: "https://api.integromat.com/v1/app/".concat(appName, "/1/module/update").concat((0, synchronizeWithIntegromat_1.capitalize)(modelName), "/api"),
            headers: {
                Authorization: "Token ".concat(token),
                'x-imt-apps-sdk-version': '1.0.0',
                'Content-Type': 'application/jsonc'
            },
            data: queryString
        };
        (0, axios_1["default"])(configApi)
            .then(function (response) {
            console.log(JSON.stringify(response));
        })["catch"](function (error) {
            console.log(JSON.stringify(error));
        });
        var parameters = Object.keys(variable).map(function (attribute) {
            var attributeObject = models[modelName].rawAttributes[attribute];
            var parameter = {
                name: attribute,
                type: models[modelName].rawAttributes[attribute].type.constructor.key,
                label: (0, synchronizeWithIntegromat_1.capitalize)(attribute),
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
            url: "https://api.integromat.com/v1/app/".concat(appName, "/1/module/update").concat((0, synchronizeWithIntegromat_1.capitalize)(modelName), "/expect"),
            headers: {
                Authorization: "Token ".concat(token),
                'x-imt-apps-sdk-version': '1.0.0',
                'Content-Type': 'application/jsonc'
            },
            data: JSON.stringify(parameters)
        };
        (0, axios_1["default"])(configExpect)
            .then(function (response) {
            console.log(JSON.stringify(response));
        })["catch"](function (error) {
            console.log(JSON.stringify(error));
        });
    })["catch"](function (error) {
        console.log(JSON.stringify(error));
    });
}
exports["default"] = addUpdateModule;
