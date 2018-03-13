import * as React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

class Timer extends React.Component<any, any> {

    format(time) {
        var milliseconds = Math.floor((time % 1000) / 10);
        var seconds = Math.floor((time / 1000) % 60);
        var minutes = Math.floor((time / (1000 * 60)) % 60);
        var hours = Math.floor((time / (1000 * 60 * 60)) % 24);

        var millisecondsText = (milliseconds < 10) ? "0" + milliseconds + "0" : milliseconds + "0";
        var hoursText = (hours < 10) ? "0" + hours : hours;
        var minutesText = (minutes < 10) ? "0" + minutes : minutes;
        var secondsText = (seconds < 10) ? "0" + seconds : seconds;

        return `${hoursText}:${minutesText}:${secondsText}.${millisecondsText}`;
    }
    render() {
        if (this.props.duration > 0) {
            return (<div>Select an impression to start playback.</div>);
        }
        var start = this.props.impression.events[0].time;
        var end = this.props.impression.events[this.props.impression.events.length - 1].time;
        var duration = end - start;

        return (
            <div className="clarity-timer">
                {this.format(this.props.snapshot)} / {this.format(end)}
            </div>
        );
    }
}

// Connnecting Timer container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => { return { snapshot: state.snapshot, impression: state.impression } }
)(Timer);