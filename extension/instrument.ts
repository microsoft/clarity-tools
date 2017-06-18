
import * as clarity from "clarity-js";

let payloads = [];

// Activate clarity instrumentation if the domain is included in the whitelist
chrome.runtime.sendMessage({ status: true }, function (response) {
  if (response.active) {
    payloads = [];
    chrome.storage.sync.get({
      clarity: {showText: false, showImages: true, enabled: true}
    }, function(items : any) {
        if (items.clarity.enabled) {
          clarity.start({
            showText: items.clarity.showText,
            showImages: items.clarity.showImages,
            uploadHandler: upload
          });
        }
    });
  }
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.clarity) {
      sendResponse({ payloads: payloads });
    }
  });

function upload(payload) {
  payloads.push(payload);
}
