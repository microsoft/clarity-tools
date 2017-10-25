import * as React from "react";
import * as ReactDOM from "react-dom";
import Snapshot from "./Snapshot";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import HeatMap from "./HeatMap";

class Replay extends React.Component<any, any> {

    render() {
        if (!this.props.impression) {
            return (<div />);
        }
      
        return (
            <div className="clarity-replay">
                <div className="clarity-snapshot">
                    <HeatMap />
                    <Snapshot />
                </div>
            </div >
        );
    }
}

// Connnecting Clarity player with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => { return { impression: state.impression } }
)(Replay);
