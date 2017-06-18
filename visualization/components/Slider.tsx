import * as React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import SliderUX from 'material-ui/Slider';
import { selectSnapshot } from "../actions";

class Slider extends React.Component<any, any> {

    slide(value, start, end) {
        value = parseInt(value);
        var position = value / 1000;
        var duration = end - start;
        var time = Math.floor(position * duration) + start;
        this.props.selectSnapshot(time);
    }

    render() {
        if (!this.props.impression) {
            return (<div>Select an impression to start playback.</div>);
        }

        var start = this.props.impression.events[0].time;
        var end = this.props.impression.events[this.props.impression.events.length - 1].time;
        var duration = end - start;
        var slider = Math.round(((this.props.snapshot - start) / duration) * 1000);

        return (
            <div className="clarity-slider">
                <SliderUX style={{ margin: 0 }} sliderStyle={{ margin: 0 }} value={slider} max={1000} onChange={(node, value) => this.slide(value, start, end)}></SliderUX>
            </div>
        );
    }
}

// Connnecting Slider container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => { return { impression: state.impression, snapshot: state.snapshot } },
    dispatch => { return bindActionCreators({ selectSnapshot: selectSnapshot }, dispatch) }
)(Slider);