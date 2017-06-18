import * as React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import IconButton from 'material-ui/IconButton';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import PauseIcon from 'material-ui/svg-icons/av/pause';
import SkipIcon from 'material-ui/svg-icons/av/av-timer';
import { selectSnapshot, togglePlayback, toggleSpeed } from "../actions";
import Slider from "./Slider";
import Timer from "./Timer";

class Player extends React.Component<any, any> {
    private interval = 33;
    private setTimeoutId = -1;
    private activeImpressionId = "";
    private keyFrames = [];

    extractFrames() {
        if (this.activeImpressionId != this.props.impression.envelope.impressionId) {
            var events = this.props.impression.events;
            var frames = []
            var startTime = 0;
            for (var evt of events) {
                if (frames.indexOf(evt.time) < 0) {
                    if (evt.type === "Layout" && evt.state.source === 0) startTime = evt.time;
                    frames.push(evt.time)
                }
            }
            this.keyFrames = frames.filter(function (x) { return x >= startTime }).sort();
            this.activeImpressionId = this.props.impression.envelope.impressionId;
        }
    }

    nextFrame(time) {
        for (var frame of this.keyFrames) {
            if (time < frame) {
                return frame % this.interval > 0 ? (Math.floor(frame / this.interval) + 1) * this.interval : frame;
            }
        }
    }
    togglePlayback() {
        if (this.props.playback) {
            this.props.togglePlayback(false);
            if (this.setTimeoutId > 0) {
                clearTimeout(this.setTimeoutId);
            }
        }
        else {
            var time = this.props.snapshot;
            var start = this.props.impression.events[0].time;
            var end = this.props.impression.events[this.props.impression.events.length - 1].time;

            if (time + 33 >= end) {
                this.props.selectSnapshot(start);
            }
            this.props.togglePlayback(true);
            this.setTimeoutId = setTimeout(this.playback.bind(this), this.interval);
        }
    }

    toggleSpeed() {
        this.props.toggleSpeed(!this.props.speed);
    }

    playback() {
        if (this.props.playback) {
            var endTime = this.props.impression.events[this.props.impression.events.length - 1].time;
            var nextTime = this.props.speed ? this.nextFrame(this.props.snapshot) : this.props.snapshot + this.interval;
            var interval = this.props.speed ? Math.min(nextTime - this.props.snapshot, this.interval) : this.interval;
            nextTime = Math.min(nextTime, endTime);
            if (nextTime < endTime) {
                this.props.selectSnapshot(nextTime);
                this.setTimeoutId = setTimeout(this.playback.bind(this), interval);
            }
            else {
                this.props.selectSnapshot(nextTime);
                this.props.togglePlayback(false);
            }
        }
    }
    render() {
        if (!this.props.impression) {
            return (<div></div>);
        }

        this.extractFrames();
        var Icon = this.props.playback ? <PauseIcon /> : <PlayIcon />;
        var speedIconColor = this.props.speed ? "white" : "#333";
        
        return (
            <div className="clarity-player">
                <div className="clarity-controls">
                    <IconButton iconStyle={{ color: "white" }} onClick={this.togglePlayback.bind(this)} >
                        {Icon}
                    </IconButton>
                    <IconButton iconStyle={{ color: speedIconColor }} onClick={this.toggleSpeed.bind(this)} >
                        <SkipIcon />
                    </IconButton>
                </div>
                <Slider />
                <Timer />
                <img className="clarity-logo" src="/clarity.png" alt="Clarity"></img>
            </div>
        );
    }

    componentWillUnmount() {
        if (this.setTimeoutId > 0) {
            clearTimeout(this.setTimeoutId);
        }
    }
}

// Connnecting Slider container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => {
        return {
            impression: state.impression,
            snapshot: state.snapshot,
            playback: state.playback,
            speed: state.speed
        }
    },
    dispatch => { return bindActionCreators({ selectSnapshot: selectSnapshot, togglePlayback: togglePlayback, toggleSpeed: toggleSpeed }, dispatch) }
)(Player);