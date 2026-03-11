"use strict";
exports.__esModule = true;
function setWebhookData(defaultData) {
    var hook = function (f) {
        defaultData.data = f(defaultData.data);
    };
    return hook;
}
exports["default"] = setWebhookData;
