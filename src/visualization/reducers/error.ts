import { Types } from "../actions";

export default function (state = null, action) {
    switch (action.type) {
        case Types.SelectSession:
            return null;
        case Types.Error:
            return action.payload;
    }
    return state;
}