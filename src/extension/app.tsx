import * as React from "react";
import * as ReactDOM from "react-dom";
import Theme from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import vibrantTheme from '../visualization/themes/vibrant';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import Content from "../visualization/components/Content";
import { parse } from "query-string";
import { createStore } from "redux";
import { Provider } from 'react-redux';
import ClarityReducer from "../visualization/reducers";
import { Types } from "../visualization/actions";
import uncompress from "../visualization/uncompress";
import * as $ from "jquery";

injectTapEventPlugin();

const store = createStore(ClarityReducer);

ReactDOM.render(
    <Provider store={store}>
        <Theme muiTheme={getMuiTheme(vibrantTheme)}>
            <Content/>
        </Theme>
    </Provider>,
    document.getElementById("preview")
);

let activeTabId = parseInt(location.href.match(/\?tab=([0-9]*$)/)[1]);
let sharingId = null;
chrome.runtime.sendMessage({ fetch: true }, function (response) {
    if (response && response.payloads) {
        let payloads = response.payloads;
        processData(payloads);
    }
});

var processData = function (data) {
    let payloads = data;
    let size = 0;
    let count = 0;
    let structured = {};
    let session = [];
    let activeId;
    let activeIndex = 0;

    // Reconstruct uncompressed clarity payload
    for (let entry of payloads) {
        size += entry.length;
        let json = null;
        json = JSON.parse(uncompress(entry.payload));
        let tabId = entry.tabId;
        let id = json.envelope.impressionId;
        if (!(id in structured)) {
            structured[id] = { envelope: json.envelope, events: [] };
            if (tabId === activeTabId) {
                activeId = id;
            }
        }
        structured[id].events = structured[id].events.concat(json.events);
        count++;
    }

    for (let id in structured) {
        if (structured[id].envelope.sequenceNumber === 0) {
            if (activeId === id) {
                activeIndex = session.length;
            }
            session.push(structured[id]);
        }
    }

    store.dispatch({
        type: Types.SelectSession,
        payload: session
    });

    store.dispatch({
        type: Types.SelectImpression,
        payload: session[activeIndex]
    });
}
