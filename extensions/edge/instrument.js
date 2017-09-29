"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var clarity = require("clarity-js");
var payloads = [];
chrome.runtime.sendMessage({ status: true }, function (response) {
    if (response.active) {
        payloads = [];
        chrome.storage.sync.get({
            clarity: { showText: false, showImages: true, showLines: true, enabled: true }
        }, function (items) {
            if (items.clarity.enabled) {
                clarity.start({
                    showText: items.clarity.showText,
                    showImages: items.clarity.showImages,
                    showLines: items.clarity.showLines,
                    uploadHandler: upload,
                    fetchColor: true,
                    instrument: true
                });
            }
        });
    }
});
function upload(payload) {
    chrome.runtime.sendMessage({ payload: payload }, function (response) {
        if (!response.success) {
            console.warn("Clarity failed to receive the payload.");
        }
    });
}
