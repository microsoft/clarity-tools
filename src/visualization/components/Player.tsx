import * as React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import IconButton from 'material-ui/IconButton';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import PauseIcon from 'material-ui/svg-icons/av/pause';
import TimelapseIcon from 'material-ui/svg-icons/image/timelapse';
import BoxModelIcon from 'material-ui/svg-icons/image/view-compact';
import NextIcon from 'material-ui/svg-icons/av/skip-next';
import PrevIcon from 'material-ui/svg-icons/av/skip-previous';
import FullPageIcon from 'material-ui/svg-icons/action/aspect-ratio';
import { selectSnapshot, togglePlayback, toggleSpeed, selectImpression, toggleBoxModel, toggleFullPage } from "../actions";
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

    toggleBoxModel() {
        this.props.toggleBoxModel(!this.props.boxmodel);
    }

    showFullPage() {
        this.props.showFullPage(!this.props.fullpage);
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

    playImpression(index) {
        this.props.selectImpression(this.props.playlist[index]);
    }

    render() {
        if (!this.props.impression) {
            return (<div></div>);
        }

        this.extractFrames();
        var index = this.props.playlist.indexOf(this.props.impression);
        var Icon = this.props.playback ? <PauseIcon /> : <PlayIcon />;
        var speedIconColor = this.props.speed ? "white" : "#666";
        var boxmodelIconColor = this.props.boxmodel ? "white" : "#666";
        var fullPageIconColor = this.props.fullpage ? "white" : "#666";
        var prevIconColor = index > 0 ? "white" : "#666";
        var nextIconColor = index < (this.props.playlist.length - 1) ? "white" : "#666";
        
        return (
            <div className="clarity-player">
                <div className="clarity-controls">
                    <IconButton iconStyle={{ color: "white" }} onClick={this.togglePlayback.bind(this)} >
                        {Icon}
                    </IconButton>
                    <IconButton iconStyle={{ color: prevIconColor }} onClick={this.playImpression.bind(this, index - 1)} >
                        <PrevIcon />
                    </IconButton>
                    <IconButton iconStyle={{ color: nextIconColor }} onClick={this.playImpression.bind(this, index + 1)} >
                        <NextIcon />
                    </IconButton>
                    <IconButton iconStyle={{ color: speedIconColor }} onClick={this.toggleSpeed.bind(this)} >
                        <TimelapseIcon />
                    </IconButton>
                    <IconButton iconStyle={{ color: boxmodelIconColor }} onClick={this.toggleBoxModel.bind(this)} >
                        <BoxModelIcon />
                    </IconButton>
                    <IconButton iconStyle={{ color: fullPageIconColor }} onClick={this.showFullPage.bind(this)} >
                        <FullPageIcon />
                    </IconButton>
                </div>
                <Slider />
                <Timer />
            </div>
        );
    }

    componentWillUnmount() {
        if (this.setTimeoutId > 0) {
            clearTimeout(this.setTimeoutId);
        }
    }

    componentDidUpdate() {
        let drawer = document.querySelector(".clarity-drawer > div");
        let active = document.querySelector(".active-step");
        if (drawer && active && active.parentElement && active.parentElement.parentElement && active.parentElement.parentElement.parentElement) {
            drawer.scrollTop = active.parentElement.parentElement.parentElement.offsetTop;    
        }
    }
}

// Connnecting Slider container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => {
        return {
            session: state.session,
            playlist: state.playlist,
            impression: state.impression,
            snapshot: state.snapshot,
            playback: state.playback,
            speed: state.speed,
            fullpage: state.fullpage,
            boxmodel: state.boxmodel
        }
    },
    dispatch => { return bindActionCreators({ 
        selectSnapshot: selectSnapshot, 
        togglePlayback: togglePlayback, 
        toggleSpeed: toggleSpeed, 
        toggleBoxModel: toggleBoxModel, 
        showFullPage: toggleFullPage,
        selectImpression: selectImpression 
    }, dispatch) }
)(Player);