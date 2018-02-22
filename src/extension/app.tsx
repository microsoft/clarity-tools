import * as React from "react";
import * as ReactDOM from "react-dom";
import Theme from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import vibrantTheme from '../visualization/themes/vibrant';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import Content from "../visualization/components/Content";
import { createStore } from "redux";
import { Provider } from 'react-redux';
import ClarityReducer from "../visualization/reducers";
import { Types } from "../visualization/actions";
import uncompress from "../visualization/uncompress";
import clarity from "clarity-js";
import { IEvent, IPayload } from "clarity-js/clarity";

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
        let extensionPayloads = response.payloads;
        let impressionSchemas = {};
        let activeIndex = 0;
        let tabPayloads = {};

        extensionPayloads.sort(compareExtensionPayloadsByTime);

        // Bucket extension payloads by tabId
        for (let payload of extensionPayloads) {
            let tabId = payload.tabId;
            if (tabId in tabPayloads) {
                tabPayloads[tabId].push(payload);
            } else {
                tabPayloads[tabId] = [payload];
            }
        }

        let activeTabPayloads = tabPayloads[activeTabId];
        let activeTabImpressions = {};
        for (let i = 0; i < activeTabPayloads.length; i++) {
            let extensionPayload = activeTabPayloads[i];
            let clarityPayload = JSON.parse(uncompress(extensionPayload.payload));
            let impressionId = clarityPayload.envelope.impressionId;

            if (!(impressionId in activeTabImpressions)) {
                activeTabImpressions[impressionId] = { envelope: clarityPayload.envelope, payloads: [] };
                activeTabImpressions[impressionId].envelope.dateTime = extensionPayload.dateTime;
                activeTabImpressions[impressionId].envelope.summary = [];
                impressionSchemas[impressionId] = new clarity.converter.SchemaManager();
            }
            
            activeTabImpressions[impressionId].payloads.push(clarityPayload);
        }

        // Sort impressions by dateTime
        let session = [];

        let impressionIds = Object.keys(activeTabImpressions);
        for (let impressionId of impressionIds) {
            session.push(activeTabImpressions[impressionId]);
        }

        session.sort(compareImpressionsByDateTime);

        // Sort payloads within impressions by envelope sequence number
        for (let i = 0; i < session.length; i++) {
            let impression = session[i];
            impression.payloads.sort(comparePayloadsBySequenceNumber);

            // Convert event arrays to events and concatenate in a single event array
            impression.events = [];
            for (let j = 0; j < impression.payloads.length; j++) {
                let events: IEvent[] = [];
                let payload = impression.payloads[j];
                let clarityJsVersion = payload.envelope.version;
                let schemas = impressionSchemas[payload.envelope.impressionId];
                if (compareVersions(clarityJsVersion, MinClarityJsVersionWithConverters) < 0) {
                    events = payload.events;
                } else {
                    for (let k = 0; k < payload.events.length; k++) {
                        let event = clarity.converter.fromarray(payload.events[k], schemas);
                        events.push(event);    
                    }
                }
                impression.events = impression.events.concat(events);


                impression.envelope.summary.push({
                    "sequenceNumber": payload.envelope.sequenceNumber,
                    "time": payload.envelope.time,
                    "events": events.length
                });
            }
            delete impression.payloads;
        }

        activeIndex = session.length > 0 ? session.length - 1 : 0;

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

function compareExtensionPayloadsByTime(p1, p2) {
    return p1.dateTime - p2.dateTime;
}

function comparePayloadsBySequenceNumber(p1: IPayload, p2: IPayload) {
    return p1.envelope.sequenceNumber - p2.envelope.sequenceNumber;
}

function compareImpressionsByDateTime(i1, i2) {
    return i1.envelope.dateTime - i2.envelope.dateTime;
}