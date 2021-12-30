"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var axios_1 = __importDefault(require("axios"));
var synchronizeWithIntegromat_1 = require("../synchronizeWithIntegromat");
function addDeleteModule(models, modelName, attributes, token, appName) {
    var data = JSON.stringify({
        name: "delete" + synchronizeWithIntegromat_1.capitalize(modelName),
        label: "Delete " + synchronizeWithIntegromat_1.capitalize(modelName),
        type_id: 4,
        crud: 'delete',
        description: "The delete endpoint for the " + synchronizeWithIntegromat_1.capitalize(modelName)
    });
    var config = {
        method: 'post',
        url: "https://api.integromat.com/v1/app/" + appName + "/1/module",
        headers: {
            Authorization: "Token " + token,
            'Content-Type': 'application/json',
            'x-imt-apps-sdk-version': '1.0.0'
        },
        data: data
    };
    axios_1["default"](config)
        .then(function (response) {
        console.log(JSON.stringify(response.data));
        var queryString = JSON.stringify({
            url: '/platform/graphql',
            method: 'POST',
            qs: {},
            body: {
                operationName: "delete" + synchronizeWithIntegromat_1.capitalize(modelName),
                variables: {
                    id: '{{id}}'
                },
                query: "mutation delete" + synchronizeWithIntegromat_1.capitalize(modelName) + "($id: Int!) {\n  " + modelName + "Delete(id: $id) \n}\n"
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
            url: "https://api.integromat.com/v1/app/" + appName + "/1/module/delete" + synchronizeWithIntegromat_1.capitalize(modelName) + "/api",
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
        var parameters = [
            {
                name: 'id',
                type: 'integer',
                label: modelName + " Id",
                required: true
            }
        ];
        var configExpect = {
            method: 'put',
            url: "https://api.integromat.com/v1/app/" + appName + "/1/module/delete" + synchronizeWithIntegromat_1.capitalize(modelName) + "/expect",
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
exports["default"] = addDeleteModule;
