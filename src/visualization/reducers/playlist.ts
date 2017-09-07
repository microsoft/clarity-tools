import { Types } from "../actions";

export default function (state = null, action) {
    switch (action.type) {
        case Types.SelectSession:
            let session = action.payload;
            let playlist = [];
            for (let impression of session) {
                if (impression.events && impression.events.length > 0) {
                    playlist.push(impression);
                }
            }
            return playlist;
    }
    return state;
}