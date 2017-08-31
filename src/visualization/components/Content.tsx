import * as React from "react";
import Replay from "./Replay";
import { connect } from "react-redux";
import LinearProgress from 'material-ui/LinearProgress';

class Content extends React.Component<any, any> {

    render() {
        let path = top.location.pathname;
        let parts = path ? path.split("/") : [];
        let notfound = parts.length == 5 ? 
            `No match found for ${parts[3]} (user) or ${parts[4]} (impression) on ${parts[2]}.` : 
            `Invalid url format.`;

        if (this.props.notfound) {
            return (
                <div className={'clarity-notfound'}>
                    <h2>{notfound}</h2>
                </div>
            );
        }
        else if (!this.props.impression) {
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
export default connect(state => { return { impression: state.impression, notfound: state.notfound } } )(Content);

