import { Types } from "../actions";

export default function (state = null, action) {
    switch (action.type) {
        case Types.SelectSession:
            for (var payload of action.payload) {
                if(payload.events && payload.events.length > 0) {
                    var lastEvent = payload.events.length - 1;
                    return parseInt(payload.events[lastEvent].time);
                }
            }
        case Types.SelectImpression:
            if (action.payload.events && action.payload.events.length > 0) {
                var lastEvent = action.payload.events.length - 1;
                return parseInt(action.payload.events[lastEvent].time);
            }
        case Types.SelectSnapshot:
            return parseInt(action.payload);
    }
    return state;
}

