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
import clarity from "clarity-js";
import { IEvent } from "clarity-js/clarity";

let compareVersions = require("compare-versions");

injectTapEventPlugin();

const MinClarityJsVersionWithConverters = "0.1.27";
const Store = createStore(ClarityReducer);

ReactDOM.render(
    <Provider store={Store}>
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
        let structuredEvents = {};
        let structuredSchemas = {};
        let session = [];
        let activeId;
        let activeIndex = 0;

        // Reconstruct uncompressed clarity payload
        for (let entry of payloads) {
            size += entry.length;
            let json = JSON.parse(uncompress(entry.payload));
            let tabId = entry.tabId;
            let id = json.envelope.impressionId;
            if (!(id in structuredEvents)) {
                structuredEvents[id] = { envelope: json.envelope, events: [] };
                structuredEvents[id]["envelope"].dateTime = entry.dateTime;
                //structuredEvents[id]["envelope"].PLTV2 = 123; // LOGIC ;
                structuredEvents[id]["envelope"].summary = [];
                structuredSchemas[id] = new clarity.converter.SchemaManager();
                if (tabId === activeTabId) {
                    activeId = id;
                }
            }

            // Convert events from crunched arrays to verbose JSONs
            let events: IEvent[] = [];
            let clarityJsVersion = json.envelope.version;
            let schemas = structuredSchemas[id];
            if (compareVersions(clarityJsVersion, MinClarityJsVersionWithConverters) < 0) {
                events = json.events;
            } else {
                for (let i = 0; i < json.events.length; i++) {
                    let event = clarity.converter.fromarray(json.events[i], schemas);
                    events.push(event);    
                }
            }

            structuredEvents[id].envelope.summary.push({
                "sequenceNumber": json.envelope.sequenceNumber,
                "time": json.envelope.time,
                "events": events.length
            });
            structuredEvents[id].events = structuredEvents[id].events.concat(events);
            count++;
        }

        for (let id in structuredEvents) {
            if (structuredEvents[id].envelope.sequenceNumber === 0) {
                if (activeId === id) {
                    activeIndex = session.length;
                }
                session.push(structuredEvents[id]);
            }
        }
            
        Store.dispatch({
            type: Types.SelectSession,
            payload: session
        });

        Store.dispatch({
            type: Types.SelectImpression,
            payload: session[activeIndex]
        });
    }
});
