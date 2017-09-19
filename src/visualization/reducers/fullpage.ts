import { Types } from "../actions";

export default function (state = false, action) {
    switch (action.type) {
        case Types.ToggleFullPage:
            return !!action.payload;
    }
    return state;
}