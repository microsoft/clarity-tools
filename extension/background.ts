let active = true;
let payloads = [];

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


chrome.tabs.onActivated.addListener(function (info) {
  chrome.tabs.get(info.tabId, function (change) {
    updateIcon(info.tabId);
  });
});

chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
  updateIcon(tabId);
});

 function updateIcon(tabId) {
  chrome.storage.sync.get({
    clarity: {showText: false, showImages: false, enabled: true}
  }, function(items : any) {
    var icon = items.clarity.enabled ? "icon.png" : "icon-disabled.png";
    var title = items.clarity.enabled ? "Clarity" : "Clarity: Disabled";
    chrome.browserAction.setIcon({ path: icon, tabId: tabId });
    chrome.browserAction.setTitle({ title: title, tabId: tabId });
  }); 
}