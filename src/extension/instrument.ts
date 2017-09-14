
import * as clarity from "clarity-js";
let payloads = [];

// Default settings state for clarity 
var state = { "showText" : false, "showImages" : true, "showLines" : true, "recording" : false, "saving": false};

// Activate clarity instrumentation by default
chrome.runtime.sendMessage({ status: true }, function (response) {
  if (response.active) {
    payloads = [];
    startClarity();
  }
});

// Start recording request
chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.start) {
      payloads = [];
      startClarity();
      sendResponse({ msg: "started recording" });
    }
  });

// Start clarity instrumentation (only if recording is on)
function startClarity() {
  chrome.storage.local.get({
    clarity: state
  }, function (items) {
    if (items.clarity.recording) {
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

function upload(payload) {
  chrome.storage.local.get({
    clarity: state
  }, function (items) {
    if (items.clarity.recording) {
      chrome.runtime.sendMessage({ payload: payload }, function (response) {
        if (!response.success) {
          console.warn("Clarity failed to receive the payload.");
        }
      });
    }
  });
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.clear) {
      chrome.runtime.sendMessage({ clear: true }, function (response) {
        if (!response.success) {
          console.warn("Clarity failed to clear the payload");
        }
      });
    }
  });
