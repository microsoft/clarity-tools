import { Types } from "../actions";

export default function (state = false, action) {
    switch (action.type) {
        case Types.ShowMenu:
            return !!action.payload;
    }
    return state;
}