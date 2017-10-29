import { Types } from "../actions";

export default function (state = 0, action) {
    switch (action.type) {
        case Types.SelectView:
            return action.payload;
    }
    return state;
}