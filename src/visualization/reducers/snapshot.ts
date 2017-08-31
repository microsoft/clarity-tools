import { Types } from "../actions";

export default function (state = null, action) {
    switch (action.type) {
        case Types.SelectSession:
            for (let impression of action.payload) {
                if(impression.events && impression.events.length > 0) {
                    let lastEvent = impression.events.length - 1;
                    return parseInt(impression.events[lastEvent].time);
                }
            }
        case Types.SelectImpression:
            if (action.payload.events && action.payload.events.length > 0) {
                let lastEvent = action.payload.events.length - 1;
                return parseInt(action.payload.events[lastEvent].time);
            }
        case Types.SelectSnapshot:
            return parseInt(action.payload);
    }
    return state;
}

