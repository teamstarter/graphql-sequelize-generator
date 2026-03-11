"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = setWebhookData;
function setWebhookData(defaultData) {
    var hook = function (f) {
        defaultData.data = f(defaultData.data);
    };
    return hook;
}
