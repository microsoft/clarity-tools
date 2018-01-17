import * as React from "react";
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import DownloadIcon from 'material-ui/svg-icons/file/file-download';
import UploadIcon from 'material-ui/svg-icons/file/file-upload';
import IconButton from 'material-ui/IconButton';
import LinearProgress from 'material-ui/LinearProgress';
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Player from "./Player";
import Session from "./Session";
import Timeline from "./Timeline";
import { showMenu, selectSession } from "../actions";
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
        a.setAttribute("download", `clarity-${this.props.impression.envelope.impressionId.toUpperCase()}.json`);
        a.href = url;
        a.click();
    }

    uploadJson() {
        let that = this;
        let input = document.createElement("input");
        input.id = "clarityJson";
        input.type = "file";
        input.style.display = "none";
        document.body.appendChild(input);
        input.onchange = function() {
            let element = this as HTMLInputElement;
            let files = element.files;
            if (files && files[0]) {
                let reader = new FileReader();
                reader.onload = function (e: Event & { target: { result: string } }) {
                    let content = e.target.result;
                    if (content && content.length > 0) {
                        let json = JSON.parse(content);
                        window["DJSON"] = json;
                        that.props.selectSession(json);
                    }
                }
                reader.readAsText(files[0]);
            }
        }
        input.click();
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
                    iconElementRight={
                        <div>
                            <IconButton iconStyle={{ color: "#666" }} onClick={this.uploadJson.bind(this)} tooltip="Upload Clarity Json"><UploadIcon/></IconButton>
                            <IconButton iconStyle={{ color: "#666" }} disabled={disabled} onClick={this.saveJson.bind(this)} tooltip="Download Clarity Json"><DownloadIcon/></IconButton>
                        </div>
                    }
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
    dispatch => { return bindActionCreators({ showMenu: showMenu, selectSession: selectSession }, dispatch) }
)(Header);
