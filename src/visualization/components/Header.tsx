import * as React from "react";
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import IconButton from 'material-ui/IconButton';
import LinearProgress from 'material-ui/LinearProgress';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Player from "./Player";
import Session from "./Session";
import Timeline from "./Timeline";
import { showMenu } from "../actions";
import { Tabs, Tab } from 'material-ui/Tabs';

class Header extends React.Component<any, any> {

    toggle() {
        this.props.showMenu(!this.props.menu);
    }
    
    saveJson() {
        let json = JSON.stringify([this.props.impression], null, 2);
        let blob = new Blob([json], {type: "application/json"});
        let url  = URL.createObjectURL(blob);

        let a = document.createElement('a');
        a.setAttribute("download", `clarity-${this.props.impression.envelope.impressionId}.json`);
        a.href = url;
        a.click();
    }

    render() {
        let ProgressBar = this.props.playlist || this.props.notfound ? <div /> : (this.props.error ? <div className="error">{this.props.error}</div> : <LinearProgress mode="indeterminate" color="#DF4931" />);
        let disabled = this.props.impression === null;

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
                    } 
                    iconElementRight={<IconButton disabled={disabled} onClick={this.saveJson.bind(this)}><DownloadIcon/></IconButton>}
                />
                <Drawer className="clarity-drawer" docked={true} open={this.props.menu}>
                    <AppBar showMenuIconButton={false} />
                     <Tabs className="clarity-tabs" tabItemContainerStyle={{backgroundColor: "#666"}}>
                        <Tab label="Session">
                            <Session />
                        </Tab>
                        <Tab label="Timeline">
                            <Timeline />
                        </Tab>
                    </Tabs>
                </Drawer>
                {ProgressBar}
            </div>
        );
    }

    componentDidUpdate() {
        let drawer = document.querySelector(".clarity-drawer > div");
        let session = document.querySelector(".clarity-session");
        let tab = session ? session.parentElement : null;
        let active = document.querySelector(".active-step");
        if (tab && tab.offsetHeight > 0 && drawer && active && active.parentElement && active.parentElement.parentElement && active.parentElement.parentElement.parentElement) {
            drawer.scrollTop = active.parentElement.parentElement.parentElement.offsetTop;    
        }
    }
}

// Connnecting Header container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => { return { menu: state.menu, impression: state.impression, playlist: state.playlist, notfound: state.notfound, error: state.error } },
    dispatch => { return bindActionCreators({ showMenu: showMenu }, dispatch) }
)(Header);
