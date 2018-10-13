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
import { IEvent, IPayload, PayloadEncoder } from "clarity-js";

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
                activeTabImpressions[impressionId] = { dateTime: extensionPayload.dateTime, payloads: [] };
            }
            activeTabImpressions[impressionId].payloads.push(clarityPayload);
        }

        let session = [];
        let impressionIds = Object.keys(activeTabImpressions);
        for (let impressionId of impressionIds) {
            session.push(activeTabImpressions[impressionId]);
        }

        session.sort(compareImpressionsByDateTime);

        // Sort payloads within impressions by envelope sequence number
        for (let i = 0; i < session.length; i++) {
            session[i] = createImpression(session[i].payloads);            
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

export function createImpression(payloads: IPayload[]) {
    let schemas = new PayloadEncoder.SchemaManager();
    payloads.sort(comparePayloadsBySequenceNumber);

    let envelope = payloads[0].envelope as any;
    envelope.summary = [];
    let impression = { envelope, events: [] };
    
    // Convert event arrays to events and concatenate in a single event array within impression object
    for (let i = 0; i < payloads.length; i++) {
        let payload = payloads[i];
        let events: IEvent[] = [];
        let clarityJsVersion = payload.envelope.version;
        if (compareVersions(clarityJsVersion, MinClarityJsVersionWithConverters) < 0) {
            events = payload.events as any as IEvent[];
        } else {
            for (let j = 0; j < payload.events.length; j++) {
                let event = PayloadEncoder.decode(payload.events[j], schemas);
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
    return impression;
}

function compareExtensionPayloadsByTime(p1, p2) {
    return p1.dateTime - p2.dateTime;
}

function comparePayloadsBySequenceNumber(p1: IPayload, p2: IPayload) {
    return p1.envelope.sequenceNumber - p2.envelope.sequenceNumber;
}

function compareImpressionsByDateTime(i1, i2) {
    return i1.dateTime - i2.dateTime;
}