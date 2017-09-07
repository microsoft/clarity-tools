import * as React from "react";
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Player from "./Player";
import Session from "./Session";
import { showMenu } from "../actions";

class Header extends React.Component<any, any> {

    render() {
        return (
            <div className="clarity-header">
                <AppBar
                    className={'clarity-bar' + (this.props.menu ? ' expanded' : '')}
                    onLeftIconButtonTouchTap={() => this.props.showMenu(!this.props.menu)}
                    title={
                        <div>
                            <img className="clarity-logo" src="/clarity.png" alt="Clarity"></img>
                            <Player />
                        </div>
                    } />
                <Drawer docked={true} open={this.props.menu}>
                    <AppBar showMenuIconButton={false} />
                    <div className="clarity-session">
                        <Session />
                    </div>
                </Drawer>
            </div>
        );
    }
}

// Connnecting Header container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => { return { menu: state.menu } },
    dispatch => { return bindActionCreators({ showMenu: showMenu }, dispatch) }
)(Header);
