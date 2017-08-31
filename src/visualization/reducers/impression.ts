import { Types } from "../actions";

export default function (state = null, action) {
    switch (action.type) {
        case Types.SelectSession:
            for (let impression of action.payload) {
                if (impression.events && impression.events.length > 0) {
                    return impression;
                }
            }
            return action.payload[0];
        case Types.SelectImpression:
            return action.payload;
    }
    return state;
}