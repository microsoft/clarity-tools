import { Types } from "../actions";

export default function (state = false, action) {
    switch (action.type) {
        case Types.ToggleSpeed:
            return action.payload;
    }
    return state;
}