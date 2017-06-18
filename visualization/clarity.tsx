import * as React from "react";
import * as ReactDOM from "react-dom";
import Theme from "material-ui/styles/MuiThemeProvider";
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import vibrantTheme from './themes/vibrant';
import * as injectTapEventPlugin from 'react-tap-event-plugin';
import Content from "./components/Content";
import { parse } from "query-string";
import { createStore } from "redux";
import { Provider } from 'react-redux';
import ClarityReducer from "./reducers";
import { Types } from "./actions";
import uncompress from "./uncompress"

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

let tabId = parseInt(location.href.match(/\?tab=([0-9]*$)/)[1]);
chrome.tabs.sendMessage(tabId, {clarity: true}, function(response) {
    let payloads = response.payloads;
    let size = 0;
    let count = 0;

    // Reconstruct uncompressed clarity payload
    let impression : any = { envelope: {}, events: [] };
    for (let payload of payloads) {
        size += payload.length;
        let json = JSON.parse(uncompress(payload));
        impression.envelope = json.envelope;
        impression.events = impression.events.concat(json.events);
        count++;
    }
        
    store.dispatch({
        type: Types.SelectImpression,
        payload: impression
    });
});