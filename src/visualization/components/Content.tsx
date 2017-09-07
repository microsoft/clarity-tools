import * as React from "react";
import Replay from "./Replay";
import { connect } from "react-redux";
import LinearProgress from 'material-ui/LinearProgress';
import Header from "./Header";

class Content extends React.Component<any, any> {

    render() {
        if (this.props.notfound) {
            return (
                <div className={'clarity-notfound'}>
                    No match found.
                </div>
            );
        }
        else if (!this.props.impression) {
            return (<LinearProgress mode="indeterminate" />);
        }
        return (
            <div className={'clarity-app'}>
                <div>
                    <Header />
                     <div className={'clarity-content' + (this.props.menu ? ' expanded' : '')}>
                        <Replay />
                    </div>
                </div >
            </div>
        );
    }
}

// Connnecting Header container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(state => { return { impression: state.impression, notfound: state.notfound, menu: state.menu } } )(Content);

