import { Types } from "../actions";

export default function (state = null, action) {
    switch (action.type) {
        case Types.PlotHeatmap:
            return action.payload;
    }
    return state;
}
