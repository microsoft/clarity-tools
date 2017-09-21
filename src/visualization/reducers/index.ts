import { combineReducers } from 'redux';
import SessionReducer from './session';
import PlaylistReducer from './playlist';
import ImpressionReducer from './impression';
import SnapshotReducer from './snapshot';
import PlaybackReducer from './playback';
import SpeedReducer from './speed';
import BoxModelReducer from './boxmodel';
import MenuReducer from './menu';
import NotFoundReducer from './notfound';
import FullPageReducer from './fullpage';

const reducers = combineReducers({
    session: SessionReducer,
    impression: ImpressionReducer,
    snapshot: SnapshotReducer,
    playlist: PlaylistReducer,
    playback: PlaybackReducer,
    speed: SpeedReducer,
    boxmodel: BoxModelReducer,
    menu: MenuReducer,
    fullpage: FullPageReducer,
    notfound: NotFoundReducer
});

export default reducers;