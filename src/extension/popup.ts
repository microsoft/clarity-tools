(function() {
    // Initialize
    var state = { "showText" : true, "showImages" : true, "showLines": true, "recording" : false, "uploaded": false, "uploadedUrl": ""}; 
    var startRecording = (<HTMLElement>document.getElementById("start"));
    var stopRecording = (<HTMLElement>document.getElementById("stop"));
    var replayLastSession = (<HTMLAnchorElement>document.getElementById("replayLastSession"));
    var replayMenu = (<HTMLElement>document.getElementById("replayMenu"));
    var date = (<HTMLElement>document.getElementById("date"));
    var saveSession = (<HTMLAnchorElement>document.getElementById("save"));
    var discardSession = (<HTMLAnchorElement>document.getElementById("discard"));
    var inputName = (<HTMLElement>document.getElementById("nickname"));
    var showText = (<HTMLInputElement>document.getElementById("showText"));
    var showImages = (<HTMLInputElement>document.getElementById("showImages"));
    var showLines = (<HTMLInputElement>document.getElementById("showLines"));
    var menu = (<HTMLElement>document.getElementById("menu"));

    // Read from default storage
    chrome.storage.local.get({clarity: state}, function(items) {
        state = items.clarity;
        redraw(state);
    });

    function setDate() {
        var now = new Date();
        (<HTMLElement>date).innerHTML=now.getFullYear().toString();
    }

    // Listen for changes
    startRecording.addEventListener("click", toggleRecording);
    stopRecording.addEventListener("click", toggleRecording);
    replayLastSession.addEventListener("click", replay);
    showText.addEventListener("click", toggleSettings);
    showImages.addEventListener("click", toggleSettings);
    showLines.addEventListener("clicl", toggleSettings);

    function replay() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = tabs[0];
            chrome.tabs.create({ url: chrome.extension.getURL('clarity.html?tab=' + tab.id) });
        });
    }

    function saveDiscardSession(cb) {      

        if (cb.target.id == "save") {
            // save session: future functionality?
        }
        else if (cb.target.id == "discard") {
            // discard session: future functionality?
        }
    }

    function toggleRecording(cb) {
        state.recording = (cb.target.id == "start") ? true : false;
        
        if (!state.recording) {
            // Any future functionality needed when stopped
            state.uploaded = false;
        }
        else {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {clear: true }, function() {
                    chrome.tabs.sendMessage(tabs[0].id, { start: true});
                });
            });
        }

        // Update storage
        chrome.storage.local.set({clarity: state}, function() {
            redraw(state);
        });
    }

    function toggleSettings(cb) {
        // Update state
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
        }
        
        // Update storage
        chrome.storage.local.set({clarity: state}, function() {
            redraw(state);
        });
    }

    function redraw(state) {
        stopRecording.style.display = state.recording ? "block" : "none";
        startRecording.style.display = state.recording ? "none" : "block";
        replayLastSession.style.display = state.recording ? "none" : "block";
        showText.checked = state.showText;
        showImages.checked = state.showImages;
        menu.style.display = state.recording ? "none" : "block";
    }

})();