(function () {
    var state = { "showText": false, "showImages": true, "showLines": true, "enabled": true };
    var showText = document.getElementById("showText");
    var showImages = document.getElementById("showImages");
    var showLines = document.getElementById("showLines");
    var enabled = document.getElementById("enabled");
    var replaySession = document.getElementById("replaySession");
    var menu = document.getElementById("menu");
    chrome.storage.sync.get({ clarity: state }, function (items) {
        state = items.clarity;
        redraw(state);
    });
    showText.addEventListener("click", toggle);
    showImages.addEventListener("click", toggle);
    showLines.addEventListener("click", toggle);
    enabled.addEventListener("click", toggle);
    replaySession.addEventListener("click", replay);
    function replay() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = tabs[0];
            chrome.tabs.create({ url: chrome.extension.getURL('clarity.html?tab=' + tab.id) });
        });
    }
    function toggle(cb) {
        switch (cb.target.id) {
            case "showText":
                state.showText = !state.showText;
                break;
            case "showImages":
                state.showImages = !state.showImages;
                break;
            case "showLines":
                state.showLines = !state.showLines;
                break;
            case "enabled":
                state.enabled = !state.enabled;
                break;
        }
        chrome.storage.sync.set({ clarity: state }, function () {
            redraw(state);
        });
    }
    function redraw(state) {
        showText.checked = state.showText;
        showImages.checked = state.showImages;
        showLines.checked = state.showLines;
        enabled.checked = state.enabled;
        menu.style.display = state.enabled ? "block" : "none";
    }
})();
