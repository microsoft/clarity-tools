let active = true;
let payloads = [];
let memorySize = 0;

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.create({ url: chrome.extension.getURL('clarity.html?tab=' + tab.id) });
});

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.status && sender && sender.tab) {
      sendResponse({ active: active });
    }
  }
);

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.payload && sender && sender.tab) {
      
      // Track sessions
      let sessionId = `${sender.tab.id}:${sender.tab.url}`;
      
      // Track memory consumption
      memorySize += request.payload.length;

      // Manage payloads
      payloads.push({tabId: sender.tab.id, sessionId: sessionId, dateTime: Date.now(), payload: request.payload});
      
      // Making sure we free up memory before we declare success
      freeUpMemory(sessionId);

      // Sending success signal
      sendResponse({ success: true });
    }
    else if (request.fetch && sender && sender.tab) {
      sendResponse({ payloads: payloads });
    }
  }
);

chrome.tabs.onActivated.addListener(function (info) {
  chrome.tabs.get(info.tabId, function (change) {
    updateIcon(info.tabId);
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
  updateIcon(tabId);
});

function freeUpMemory(activeSession?: string) {
  // Start clearing older sessions when memory consumption increases 3MB
  let deletedSessions = [];
  activeSession = activeSession || null;
  while (payloads.length > 0 && activeSession !== payloads[0].sessionId && memorySize > 3 * 1024 * 1024) 
  {
      let payload = payloads.shift();
      let sessionId = payload.sessionId;
      if (deletedSessions.indexOf(sessionId) < 0) {
        deletedSessions.push(sessionId);
      }
      memorySize -= payload.payload.length;
  }

  // Delete complete sessions for which at least one payload was deleted
  let index = 0;
  while (deletedSessions.length > 0 && index < payloads.length) {
    if (deletedSessions.indexOf(payloads[index].sessionId) >= 0) {
      let payload = payloads.splice(index, 1);
      memorySize -= payload[0].payload.length;
    }
    else {
      index++;
    }
  }
}

function updateIcon(tabId) {
  chrome.storage.sync.get({
    clarity: {showText: false, showImages: false, enabled: true}
  }, function(items : any) {
    var icon = items.clarity.enabled ? "icon.png" : "icon-disabled.png";
    var title = items.clarity.enabled ? "Clarity" : "Clarity: Disabled";
    chrome.browserAction.setIcon({ path: icon, tabId: tabId });
    chrome.browserAction.setTitle({ title: title, tabId: tabId });
  }); 
  freeUpMemory();
}