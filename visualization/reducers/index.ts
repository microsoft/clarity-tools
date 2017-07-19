import { combineReducers } from 'redux';
import SessionReducer from './session';
import ImpressionReducer from './impression';
import SnapshotReducer from './snapshot';
import PlaybackReducer from './playback';
import SpeedReducer from './speed';

const reducers = combineReducers({
    session: SessionReducer,
    impression: ImpressionReducer,
    snapshot: SnapshotReducer,
    playback: PlaybackReducer,
    speed: SpeedReducer    
});

export default reducers;