"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var axios_1 = __importDefault(require("axios"));
var synchronizeWithIntegromat_1 = require("../synchronizeWithIntegromat");
function addReadModule(models, modelName, attributes, token, appName) {
    var returnAttrinutes = '';
    attributes.forEach(function (attribute) {
        returnAttrinutes += attribute + "\n    ";
    });
    var data = JSON.stringify({
        name: "read" + synchronizeWithIntegromat_1.capitalize(modelName),
        label: "Read " + synchronizeWithIntegromat_1.capitalize(modelName),
        type_id: 4,
        crud: 'read',
        description: "The read endpoint for the " + synchronizeWithIntegromat_1.capitalize(modelName)
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
                operationName: modelName,
                variables: {
                    where: '{{where}}'
                },
                query: "query read" + synchronizeWithIntegromat_1.capitalize(modelName) + "($where: SequelizeJSON!) {\n  " + modelName + "(where: $where) {\n    " + returnAttrinutes + "__typename\n  }\n}\n"
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
            url: "https://api.integromat.com/v1/app/" + appName + "/1/module/read" + synchronizeWithIntegromat_1.capitalize(modelName) + "/api",
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
                name: 'where',
                type: 'json',
                label: 'Where',
                required: true
            }
        ];
        var configExpect = {
            method: 'put',
            url: "https://api.integromat.com/v1/app/" + appName + "/1/module/read" + synchronizeWithIntegromat_1.capitalize(modelName) + "/expect",
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
exports["default"] = addReadModule;
