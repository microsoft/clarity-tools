"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var ReactDOM = require("react-dom");
var MuiThemeProvider_1 = require("material-ui/styles/MuiThemeProvider");
var getMuiTheme_1 = require("material-ui/styles/getMuiTheme");
var vibrant_1 = require("../../visualization/themes/vibrant");
var injectTapEventPlugin = require("react-tap-event-plugin");
var Content_1 = require("../../visualization/components/Content");
var redux_1 = require("redux");
var react_redux_1 = require("react-redux");
var reducers_1 = require("../../visualization/reducers");
var uncompress_1 = require("../../visualization/uncompress");
injectTapEventPlugin();
var store = redux_1.createStore(reducers_1.default);
ReactDOM.render(React.createElement(react_redux_1.Provider, { store: store },
    React.createElement(MuiThemeProvider_1.default, { muiTheme: getMuiTheme_1.default(vibrant_1.default) },
        React.createElement(Content_1.default, null))), document.getElementById("preview"));
var activeTabId = parseInt(location.href.match(/\?tab=([0-9]*$)/)[1]);
chrome.runtime.sendMessage({ fetch: true }, function (response) {
    if (response.payloads) {
        var payloads_1 = response.payloads;
        var size = 0;
        var count = 0;
        var structured = {};
        var session = [];
        var activeId = void 0;
        var activeIndex = 0;
        for (var _i = 0, payloads_2 = payloads_1; _i < payloads_2.length; _i++) {
            var entry = payloads_2[_i];
            size += entry.length;
            var json = JSON.parse(uncompress_1.default(entry.payload));
            var tabId = entry.tabId;
            var id = json.envelope.impressionId;
            if (!(id in structured)) {
                structured[id] = { envelope: json.envelope, events: [] };
                structured[id]["envelope"].dateTime = entry.dateTime;
                if (tabId === activeTabId) {
                    activeId = id;
                }
            }
            structured[id].events = structured[id].events.concat(json.events);
            count++;
        }
        for (var id in structured) {
            if (structured[id].envelope.sequenceNumber === 0) {
                if (activeId === id) {
                    activeIndex = session.length;
                }
                session.push(structured[id]);
            }
        }
        store.dispatch({
            type: 0,
            payload: session
        });
        store.dispatch({
            type: 1,
            payload: session[activeIndex]
        });
    }
});
