import * as React from "react";
import Replay from "./Replay";
import { connect } from "react-redux";
import { Tabs, Tab } from 'material-ui/Tabs';
import SwipeableViews from 'react-swipeable-views';
import { selectView } from "../actions";
import { bindActionCreators } from "redux";
import Header from "./Header";

class Content extends React.Component<any, any> {
    
    render() {
        
        let path = top.location.pathname;
        let parts = path ? path.split("/") : [];
        let notfound = parts.length === 5 || parts.length === 6 ?
            `No match found.` :
            `Invalid url format.`;

        let Content = this.props.notfound ? <div className={'clarity-notfound'}>{notfound}</div> : <Replay />;

        if (this.props.impression != null) {
            return (
            <div className={'clarity-app'}>
                <div>
                    <Header />
                    <div className={'clarity-content' + (this.props.menu ? ' expanded' : '')}>
                        <Tabs className="clarity-tabs" onChange={this.props.selectView} value={this.props.view} tabItemContainerStyle={{backgroundColor: "#666"}}>
                            <Tab label="Replay" value={0} />
                            <Tab label="Box Model" value={1} />
                            <Tab label="Page Performance" value={2} />
                        </Tabs>
                        <SwipeableViews index={this.props.view} onChangeIndex={this.props.selectView}>
                            {Content}
                            {Content}
                            {Content}
                        </SwipeableViews>
                    </div>
                </div >
            </div>
            );
        } else {
            return (
                <div className={'clarity-app'}>
                <div>
                    <Header />
                </div >
            </div>
            );
        }
        
    }
}

// Connnecting Header container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => { return { impression: state.impression, notfound: state.notfound, menu: state.menu, view: state.view } },
    dispatch => { return bindActionCreators({ 
        selectView: selectView
    }, dispatch) }
)(Content);