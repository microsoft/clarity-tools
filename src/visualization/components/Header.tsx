import * as React from "react";
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Player from "./Player";
import Session from "./Session";
import { showMenu } from "../actions";

class Header extends React.Component<any, any> {

    toggle() {
        this.props.showMenu(!this.props.menu);
    }

    render() {
        let ProgressBar = this.props.playlist ? <div /> : (this.props.notfound ? <div>Not found.</div> : <LinearProgress mode="indeterminate" color="#DF4931" />);

        return (
            <div className="clarity-header">
                <AppBar
                    className={'clarity-bar' + (this.props.menu ? ' expanded' : '')}
                    onLeftIconButtonTouchTap={this.toggle.bind(this)}
                    title={
                        <div>
                            <img className="clarity-logo" src="/clarity.png" alt="Clarity"></img>
                            <Player />
                        </div>
                    } />
                <Drawer className="clarity-drawer" docked={true} open={this.props.menu}>
                    <AppBar showMenuIconButton={false} />
                    <div className="clarity-session">
                        <Session />
                    </div>
                </Drawer>
                {ProgressBar}
            </div>
        );
    }

    componentDidUpdate() {
        let drawer = document.querySelector(".clarity-drawer > div");
        let active = document.querySelector(".active-step");
        if (drawer && active && active.parentElement && active.parentElement.parentElement && active.parentElement.parentElement.parentElement) {
            drawer.scrollTop = active.parentElement.parentElement.parentElement.offsetTop;    
        }
    }
}

// Connnecting Header container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => { return { menu: state.menu, playlist: state.playlist, notfound: state.notfound } },
    dispatch => { return bindActionCreators({ showMenu: showMenu }, dispatch) }
)(Header);
