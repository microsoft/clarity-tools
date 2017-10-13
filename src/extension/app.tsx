import * as React from "react";
import * as ReactDOM from "react-dom";
import Theme from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import vibrantTheme from '../visualization/themes/vibrant';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import { selectImpression, selectSession } from "../visualization/actions/index";
import Content from "../visualization/components/Content";
import { parse } from "query-string";
import { createStore } from "redux";
import { Provider } from 'react-redux';
import ClarityReducer from "../visualization/reducers";
import { Types } from "../visualization/actions";
import uncompress from "../visualization/uncompress"

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
chrome.runtime.sendMessage({ fetch: true }, function (response) {
    if (response.payloads) {
        let payloads = response.payloads;
        let size = 0;
        let count = 0;
        let structured = {};
        let session = [];
        let activeId;
        let activeIndex = 0;

        // Reconstruct uncompressed clarity payload
        for (let entry of payloads) {
            size += entry.length;
            let json = JSON.parse(uncompress(entry.payload));
            let tabId = entry.tabId;
            let id = json.envelope.impressionId;
            if (!(id in structured)) {
                if (json.envelope.sequenceNumber !== 0) {
                    console.warn(`First payload for impression id ${id} has sequence number ${json.envelope.sequenceNumber}`);
                    continue;
                }
                let metadata = json.metadata;
                structured[id] = { metadata, events: [] };
                structured[id].metadata.dateTime = entry.dateTime;
                structured[id].metadata.summary = [];
                if (tabId === activeTabId) {
                    activeId = id;
                }
            }
            structured[id].metadata.summary.push({
                "sequenceNumber": json.envelope.sequenceNumber,
                "time": json.envelope.time,
                "events": json.events.length
            });
            structured[id].events = structured[id].events.concat(json.events);
            count++;
        }

        for (let id in structured) {
            if (activeId === id) {
                activeIndex = session.length;
            }
            session.push(structured[id]);
        }
            
        store.dispatch(selectSession(session));
        store.dispatch(selectImpression(session[activeIndex]));
    }
});