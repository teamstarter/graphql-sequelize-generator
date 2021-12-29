"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.capitalize = void 0;
var axios_1 = __importDefault(require("axios"));
var addCreateModule_1 = __importDefault(require("./addModules/addCreateModule"));
var addDeleteModule_1 = __importDefault(require("./addModules/addDeleteModule"));
var addReadModule_1 = __importDefault(require("./addModules/addReadModule"));
var addUpdateModule_1 = __importDefault(require("./addModules/addUpdateModule"));
var addModules = {
    read: addReadModule_1["default"],
    create: addCreateModule_1["default"],
    update: addUpdateModule_1["default"],
    "delete": addDeleteModule_1["default"]
};
function capitalize(s) {
    return s[0].toUpperCase() + s.slice(1);
}
exports.capitalize = capitalize;
function synchronizeWithIntegromat(models, token) {
    Object.keys(models.sequelize.models).forEach(function (modelName) {
        if (models[modelName]) {
            ;
            ['read', 'create', 'update', 'delete'].forEach(function (action) {
                var attributes = Object.keys(models[modelName].rawAttributes);
                var config = {
                    method: 'get',
                    url: "https://api.integromat.com/v1/app/test-app-894954/1/module/" + action + capitalize(modelName),
                    headers: {
                        Authorization: "Token " + token,
                        'x-imt-apps-sdk-version': '1.3.8'
                    }
                };
                axios_1["default"](config)
                    .then(function (response) {
                    console.log("Module \"" + response.data.label + "\" already exists.");
                })["catch"](function (error) {
                    console.log(error.response.data);
                    if (error.response.data.code === 'IM005') {
                        addModules[action](models, modelName, attributes, token);
                    }
                });
            });
        }
    });
}
exports["default"] = synchronizeWithIntegromat;
