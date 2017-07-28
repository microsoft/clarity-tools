import { Types } from "../actions";

export default function (state = null, action) {
    switch (action.type) {
        case Types.SelectSession:
            return action.payload[0];
        case Types.SelectImpression:
            return action.payload;
    }
    return state;
}