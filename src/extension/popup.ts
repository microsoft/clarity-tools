(function() {
    // Initialize
    var state = { "showText" : false, "showImages" : true, "enabled" : true }; 
    var showText = (<HTMLInputElement>document.getElementById("showText"));
    var showImages = (<HTMLInputElement>document.getElementById("showImages"));
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
    showImages.addEventListener("click", toggle);
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
            case "showImages":
                state.showImages = !state.showImages;
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
        showImages.checked = state.showImages;
        enabled.checked = state.enabled;
        menu.style.display = state.enabled ? "block" : "none";
    }
})();