import { Types } from "../actions";

export default function (state = null, action) {
    switch (action.type) {
        case Types.SelectSession:
            for (var payload of action.payload) {
                if (payload.events && payload.events.length > 0) {
                    return payload;
                }
            }
            return action.payload[0];
        case Types.SelectImpression:
            return action.payload;
    }
    return state;
}