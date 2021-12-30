"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
function synchronizeWithIntegromat(models, token, appName) {
    return __awaiter(this, void 0, void 0, function () {
        var _loop_1, modelName;
        var _this = this;
        return __generator(this, function (_a) {
            _loop_1 = function (modelName) {
                if (models[modelName]) {
                    ;
                    ['read', 'create', 'update', 'delete'].forEach(function (action) { return __awaiter(_this, void 0, void 0, function () {
                        var attributes, config, response, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    attributes = Object.keys(models[modelName].rawAttributes);
                                    config = {
                                        method: 'get',
                                        url: "https://api.integromat.com/v1/app/" + appName + "/1/module/" + action + capitalize(modelName),
                                        headers: {
                                            Authorization: "Token " + token,
                                            'x-imt-apps-sdk-version': '1.3.8'
                                        }
                                    };
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, axios_1["default"](config)];
                                case 2:
                                    response = _a.sent();
                                    console.log("Module \"" + response.data.label + "\" already exists.");
                                    return [3 /*break*/, 4];
                                case 3:
                                    error_1 = _a.sent();
                                    console.log(JSON.stringify(error_1));
                                    if (error_1.response.data.code === 'IM005') {
                                        addModules[action](models, modelName, attributes, token, appName);
                                    }
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                }
            };
            // Object.keys(models.sequelize.models).forEach(modelName => {
            for (modelName in models.sequelize.models) {
                _loop_1(modelName);
            }
            return [2 /*return*/];
        });
    });
}
exports["default"] = synchronizeWithIntegromat;
