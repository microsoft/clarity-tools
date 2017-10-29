
import * as clarity from "clarity-js";
let payloads = [];

chrome.runtime.sendMessage({ status: true }, function (response) {
  if (response.active) {
    payloads = [];
    chrome.storage.sync.get({
      clarity: {showText: false, showImages: true, showLines: true, enabled: true}
    }, function(items : any) {
        if (items.clarity.enabled) {
          clarity.start({
            showText: items.clarity.showText,
            showImages: items.clarity.showImages,
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
