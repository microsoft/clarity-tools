import * as React from "react";
import Replay from "./Replay";
import { connect } from "react-redux";
import Header from "./Header";

class Content extends React.Component<any, any> {

    render() {
        let path = top.location.pathname;
        let parts = path ? path.split("/") : [];
        let notfound = parts.length == 5 ? 
            `No match found for ${parts[3]} (user) or ${parts[4]} (impression) on ${parts[2]}.` : 
            `Invalid url format.`;

        let Content = this.props.notfound ? <div className={'clarity-notfound'}>{notfound}</div> : <Replay />;

        return (
            <div className={'clarity-app'}>
                <div>
                    <Header />
                    <div className={'clarity-content' + (this.props.menu ? ' expanded' : '')}>
                        {Content}
                    </div>
                </div >
            </div>
        );
    }
}

// Connnecting Header container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(state => { return { impression: state.impression, notfound: state.notfound, menu: state.menu } } )(Content);

