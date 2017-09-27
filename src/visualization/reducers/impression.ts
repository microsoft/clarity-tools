import { Types } from "../actions";

export default function (state = null, action) {
    switch (action.type) {
        case Types.SelectSession:
            for (let impression of action.payload) {
                if (impression.events && impression.events.length > 0) {
                    return impression;
                }
            }
            return sort(action.payload[0]);
        case Types.SelectImpression:
            return sort(action.payload);
    }
    return state;
}

function sort(impression) {
    if (impression && impression.events && impression.events.length > 0) {
        impression.events = impression.events.sort(function(a, b) {
            return a.time === b.time ? a.id - b.id : a.time - b.time;
        });
    }
    return impression;
}