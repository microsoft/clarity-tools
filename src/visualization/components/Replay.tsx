import * as React from "react";
import * as ReactDOM from "react-dom";
import * as $ from "jquery"; 
import Snapshot from "./Snapshot";
import Session from "./Session";
import Player from "./Player";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";

class Replay extends React.Component<any, any> {

    render() {
        if (!this.props.impression) {
            return (<div />);
        }


        return (
            <div className="clarity-replay">
                <Player />
                <div className="clarity-session">
                    <Session />
                </div>
                <div className="clarity-snapshot">
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

