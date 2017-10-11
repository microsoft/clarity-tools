import { Types } from "../actions";

export default function (state = true, action) {
    switch (action.type) {
        case Types.ToggleInactiveSession:
            return action.payload;
    }
    return state;
}