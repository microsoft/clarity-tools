import { Types } from "../actions";

export default function (state = null, action) {
    switch (action.type) {
        case Types.SelectImpression:
            var lastEvent = action.payload.events.length - 1;
            return parseInt(action.payload.events[lastEvent].time);
        case Types.SelectSnapshot:
            return parseInt(action.payload);
    }
    return state;
}

