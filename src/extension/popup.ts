(function() {
    // Initialize
    var state = { "showText" : false, "showImages" : true, "recording" : false, "saving": false}; 
    var startRecording = (<HTMLElement>document.getElementById("start"));
    var stopRecording = (<HTMLElement>document.getElementById("stop"));
    var replayLastSession = (<HTMLAnchorElement>document.getElementById("replayLastSession"));
    var replayMenu = (<HTMLElement>document.getElementById("replayMenu"));
    var date = (<HTMLElement>document.getElementById("date"));
    var saveSession = (<HTMLAnchorElement>document.getElementById("save"));
    var discardSession = (<HTMLAnchorElement>document.getElementById("discard"));
    var inputName = (<HTMLElement>document.getElementById("nickname"));
    var saveMenu = (<HTMLElement>document.getElementById("saveMenu"));
    var showText = (<HTMLInputElement>document.getElementById("showText"));
    var showImages = (<HTMLInputElement>document.getElementById("showImages"));
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
    //inputName.addEventListener("keyup", saveDiscardSession);
    saveSession.addEventListener("click", saveDiscardSession);
    discardSession.addEventListener("click", saveDiscardSession);
    showText.addEventListener("click", toggleSettings);
    showImages.addEventListener("click", toggleSettings);

    function replay() {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            var tab = tabs[0];
            chrome.tabs.create({ url: chrome.extension.getURL('clarity.html?tab=' + tab.id) });
        });
    }

    function saveDiscardSession(cb) {      
        state.saving = false;

        if (cb.target.id == "save") {
            console.log("sending save message");
            chrome.runtime.sendMessage({ save: true, nickname: (<HTMLInputElement>inputName).value });
            chrome.runtime.sendMessage({ save: true, message: "HELLO4" });
            chrome.runtime.sendMessage({ sendPayload: true, message: "HELLO4" }, function (resp) {
                console.log(resp);
            });

        }
        else if (cb.target.id == "discard") {
            // discard session: future functionality?
        }

        chrome.storage.local.set({clarity: state}, function() {
            redraw(state);
        });
    }

    function toggleRecording(cb) {
        state.recording = (cb.target.id == "start") ? true : false;
        state.saving = state.recording ? false : true;
        
        if (!state.recording) {
            // Any future functionality needed when stopped
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
        }
        
        // Update storage
        chrome.storage.local.set({clarity: state}, function() {
            redraw(state);
        });
    }

    function redraw(state) {
        stopRecording.style.display = state.recording ? "block" : "none";
        startRecording.style.display = state.recording ? "none" : "block";
        //saveMenu.style.display = state.saving ? "block" : "none";
        //replayMenu.style.display = (state.saving || !state.recording) ? "none" : "block";
        showText.checked = state.showText;
        showImages.checked = state.showImages;
        menu.style.display = state.recording ? "none" : "block";
    }

})();