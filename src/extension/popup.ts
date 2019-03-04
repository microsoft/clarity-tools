(function() {
    // Initialize
    var state = { "showText" : false, "cssRules": false, "enabled" : true }; 
    var showText = (<HTMLInputElement>document.getElementById("showText"));
    var cssRules = (<HTMLInputElement>document.getElementById("cssRules"));
    var enabled = (<HTMLInputElement>document.getElementById("enabled"));
    var replaySession = (<HTMLAnchorElement>document.getElementById("replaySession"));
    var menu = (<HTMLElement>document.getElementById("menu"));

    // Read from default storage
    chrome.storage.sync.get({clarity: state}, function(items) {
        state = items.clarity;
        redraw(state);
    }); 

    // Listen for changes
    showText.addEventListener("click", toggle);
    cssRules.addEventListener("click", toggle);
    enabled.addEventListener("click", toggle);
    replaySession.addEventListener("click", replay);

    function replay() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = tabs[0];
            chrome.tabs.create({ url: chrome.extension.getURL('clarity.html?tab=' + tab.id) });
        });
    }
    function toggle(cb) {
        // Update state
        switch (cb.target.id) {
            case "showText":
                state.showText = !state.showText;
                break;
            case "cssRules":
                state.cssRules = !state.cssRules;
                break;
            case "enabled":
                state.enabled = !state.enabled;
                break;
        }
        
        // Update storage
        chrome.storage.sync.set({clarity: state}, function() {
            redraw(state);    
        });
    }

    function redraw(state) {
        showText.checked = state.showText;
        cssRules.checked = state.cssRules;
        enabled.checked = state.enabled;
        menu.style.display = state.enabled ? "block" : "none";
    }
})();