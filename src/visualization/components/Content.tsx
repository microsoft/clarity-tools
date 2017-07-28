import * as React from "react";
import Replay from "./Replay";
import { connect } from "react-redux";
import LinearProgress from 'material-ui/LinearProgress';

class Content extends React.Component<any, any> {

    render() {
        if (!this.props.impression) {
            return (<LinearProgress mode="indeterminate" />);
        }
        return (
            <div className={'clarity-content'}>
                    <Replay />
            </div>
        );
    }
}

// Connnecting Header container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(state => { return { impression: state.impression } } )(Content);

