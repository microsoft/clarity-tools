import { combineReducers } from 'redux';
import SessionReducer from './session';
import ImpressionReducer from './impression';
import SnapshotReducer from './snapshot';
import PlaybackReducer from './playback';
import SpeedReducer from './speed';
import BoxModelReducer from './boxmodel';
import MenuReducer from './menu';
import NotFoundReducer from './notfound';

const reducers = combineReducers({
    session: SessionReducer,
    impression: ImpressionReducer,
    snapshot: SnapshotReducer,
    playback: PlaybackReducer,
    speed: SpeedReducer,
    boxmodel: BoxModelReducer,
    menu: MenuReducer,
    notfound: NotFoundReducer
});

export default reducers;