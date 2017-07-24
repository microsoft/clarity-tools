
import * as clarity from "clarity-js";
//import * as azureStorage from "azure-storage";
let payloads = [];

//var tableSvc = azureStorage.createTableService("claritylogs", "Ysoj+My6+VY3SFdwz20Y6iPs9fMBH4nBx8CqlGTwZMSDnBTCaXI9BDLHssjynj/h4uOoq1hEkVpL/qU3k2ts3w==");

// Default settings state for clarity 
var state = { "showText" : false, "showImages" : true, "recording" : false, "saving": false};

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
      console.log("attempting to start");
      payloads = [];
      startClarity();
      sendResponse({ msg: "started" });
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
        uploadHandler: upload
      });
    }
  });
}

function upload(payload) {
  chrome.runtime.sendMessage({ payload: payload }, function (response) {
    if (!response.success) {
      console.warn("Clarity failed to receive the payload.");
    }
  });
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.save) {
      console.log("saving on instrument");
      chrome.runtime.sendMessage({ sendPayload: true, message: "HELLO9" }, function (resp) {
        console.log(resp);
      });
      sendResponse({ msg: "tried to save" });
    }
  });



chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.sendPayload) {
      console.log("sending on instrument");
      chrome.runtime.sendMessage({ sendPayload: true, message: "HELLO5" }, function (resp) {
        console.log(resp);
      });
      sendResponse({ msg: "tried to send from instrument" });
    }
  });
