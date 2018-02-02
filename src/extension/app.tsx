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
        let structured = {};
        let session = [];
        let activeId;
        let activeIndex = 0;

        // Reconstruct uncompressed clarity payload
        for (let entry of payloads) {
            size += entry.length;
            let json = JSON.parse(uncompress(entry.payload));
            let clarityJsVersion = json.envelope.version;

            // Convert events from crunched arrays to verbose JSONs
            let events: IEvent[] = [];
            if (compareVersions(clarityJsVersion, MinClarityJsVersionWithConverters) < 0) {
                events = json.events;
            } else {
                for (let i = 0; i < json.events.length; i++) {
                    let event = clarity.converter.fromarray(json.events[i]);
                    events.push(event);    
                }
            }

            let tabId = entry.tabId;
            let id = json.envelope.impressionId;
            if (!(id in structured)) {
                structured[id] = { envelope: json.envelope, events: [] };
                structured[id]["envelope"].dateTime = entry.dateTime;
                structured[id]["envelope"].summary = [];
                if (tabId === activeTabId) {
                    activeId = id;
                }
            }
            structured[id].envelope.summary.push({
                "sequenceNumber": json.envelope.sequenceNumber,
                "time": json.envelope.time,
                "events": events.length
            });
            structured[id].events = structured[id].events.concat(events);
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

function compareVersions(v1: string, v2: string): number | null {
    if (!isValidVersion(v1)) {
        console.warn("Invalid version format: " + v1);
        return;
    }
    if (!isValidVersion(v2)) {
        console.warn("Invalid version format: " + v2);
        return;
    }
    if (v1 === v2) {
        return 0;
    }
    let v1Parts = v1.split(".");
    let v2Parts = v2.split(".");
    let minLength = Math.min(v1Parts.length, v2Parts.length);
    for (let i = 0; i < minLength; i++) {
        let v1Part = parseInt(v1Parts[i]);
        let v2Part = parseInt(v2Parts[i]);
        if (v1Part !== v2Part) {
            return v1Part > v2Part ? 1 : -1;
        }
    }
    return v2Parts.length === minLength ? 1 : -1;
}

function isValidVersion(version: string) {
    let parts = version.split(".");
    for (let i = 0; i < parts.length; i++) {
        let part = parts[i];

        // Checks that the part is not empty
        if (part.length === 0) {
            return false;
        }

        // Checks that every symbol in each part is numeric
        // This will filter out non-numbers and valid numbers that are not version identifiers such as '-1' and '1e1000'
        for (let j = 0; j < part.length; j++) {
            if (isNaN(parseInt(part[j]))) {
                return false;
            }
        }

        // Checks part that starts with a 0, doesn't have any other symbols
        if (part.length > 1 && part[0] === "0") {
            return false;
        }
    }
    return true;
}