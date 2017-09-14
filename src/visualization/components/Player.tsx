import * as React from "react";
import * as $ from "jquery";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import IconButton from 'material-ui/IconButton';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import LinearProgress from 'material-ui/LinearProgress';
import Dialog from 'material-ui/Dialog';
import PlayIcon from 'material-ui/svg-icons/av/play-arrow';
import PauseIcon from 'material-ui/svg-icons/av/pause';
import TimelapseIcon from 'material-ui/svg-icons/image/timelapse';
import BoxModelIcon from 'material-ui/svg-icons/image/view-compact';
import SkipIcon from 'material-ui/svg-icons/av/fast-forward';
import NextIcon from 'material-ui/svg-icons/av/skip-next';
import PrevIcon from 'material-ui/svg-icons/av/skip-previous';
import ShareIcon from 'material-ui/svg-icons/communication/screen-share';
import * as CopyToClipboard from 'react-copy-to-clipboard';
import { selectSnapshot, togglePlayback, toggleSpeed, selectImpression, toggleBoxModel } from "../actions";
import Slider from "./Slider";
import Timer from "./Timer";
import compress from '../compress';
import uncompress from '../uncompress'

class Player extends React.Component<any, any> {

    private extensionCreateBlobAPIEndpoint = '';
    private extensionUploadBlobAPIEndpoint = '';
    private extensionShareURL = '';

    private interval = 33;
    private setTimeoutId = -1;
    private activeImpressionId = "";
    private keyFrames = [];
    public state = {
        open: false,
        completed: 0,
        message: '',
        url: '', 
    }

    private FacebookShareButton;

    constructor(props) {
        super(props);

        this.state = {
            open: false,
            completed: 0,
            message: '',
            url: '',
        }
    } 

    extractFrames() {
        if (this.activeImpressionId != this.props.impression.envelope.impressionId) {
            var events = this.props.impression.events;
            var frames = []
            var startTime = 0;
            for (var evt of events) {
                if (frames.indexOf(evt.time) < 0) {
                    if (evt.type === "Layout" && evt.state.source === 0) startTime = evt.time;
                    frames.push(evt.time)
                }
            }
            this.keyFrames = frames.filter(function (x) { return x >= startTime }).sort();
            this.activeImpressionId = this.props.impression.envelope.impressionId;
        }
    }

    nextFrame(time) {
        for (var frame of this.keyFrames) {
            if (time < frame) {
                return frame % this.interval > 0 ? (Math.floor(frame / this.interval) + 1) * this.interval : frame;
            }
        }
    }
    togglePlayback() {
        if (this.props.playback) {
            this.props.togglePlayback(false);
            if (this.setTimeoutId > 0) {
                clearTimeout(this.setTimeoutId);
            }
        }
        else {
            var time = this.props.snapshot;
            var start = this.props.impression.events[0].time;
            var end = this.props.impression.events[this.props.impression.events.length - 1].time;

            if (time + 33 >= end) {
                this.props.selectSnapshot(start);
            }
            this.props.togglePlayback(true);
            this.setTimeoutId = setTimeout(this.playback.bind(this), this.interval);
        }
    }

    toggleSpeed() {
        this.props.toggleSpeed(!this.props.speed);
    }

    toggleBoxModel() {
        this.props.toggleBoxModel(!this.props.boxmodel);
    }

    playback() {
        if (this.props.playback) {
            var endTime = this.props.impression.events[this.props.impression.events.length - 1].time;
            var nextTime = this.props.speed ? this.nextFrame(this.props.snapshot) : this.props.snapshot + this.interval;
            var interval = this.props.speed ? Math.min(nextTime - this.props.snapshot, this.interval) : this.interval;
            nextTime = Math.min(nextTime, endTime);
            if (nextTime < endTime) {
                this.props.selectSnapshot(nextTime);
                this.setTimeoutId = setTimeout(this.playback.bind(this), interval);
            }
            else {
                this.props.selectSnapshot(nextTime);
                this.props.togglePlayback(false);
            }
        }
    }

    playImpression(index) {
        this.props.selectImpression(this.props.session[index]);
    }

    uploadAndShare() {
        var state = { "showText": true, "showImages": true, "recording": false, "saving": false, "uploaded": false, "uploadedUrl": "" };
        var thisRef = this;
        thisRef.openShareWindow();

        // Read from default storage
        chrome.storage.local.get({ clarity: state }, function (items) {
            state = items.clarity;

            if (!state.uploaded) {
                
                chrome.runtime.sendMessage({ fetch: true }, function (response) {
                    var rawData = response;
                    var logJSON = JSON.stringify({ response });
                    var len = 250000;
                    var numChunks = Math.ceil(logJSON.length / len),
                        splitLogs = new Array(numChunks);

                    for (var i = 0, o = 0; i < numChunks; ++i, o += len) {
                        splitLogs[i] = logJSON.substr(o, len);
                    }
                            
                    var splitSize = splitLogs.length;
                    
                    $.ajax({
                        type: 'GET',
                        url: thisRef.extensionCreateBlobAPIEndpoint,
                        success: function (response) {
                            thisRef.setProgress(100 / (splitSize + 1));
                            var id = response.id;
                            var url = thisRef.extensionShareURL + id;
                            state.uploadedUrl = url;
                            chrome.storage.local.set({ clarity: state });
                            
                            var counter = 1;
                            var currStage = 1;
                            var chain = $.Deferred();
                            var promise;
                            for (var i = 0; i < splitLogs.length; i++) {

                                if (i == 0) {
                                    promise = chain;
                                }

                                promise = promise.then(function (response) {
                                    var chunk = this.shift();

                                    return $.ajax({
                                        type: 'POST',
                                        url: thisRef.extensionUploadBlobAPIEndpoint + '?id=extensionlogs&pg=' + id + '&last=' + (counter == splitSize),
                                        contentType: 'application/json',
                                        data: JSON.stringify({ 'session': chunk }),
                                        success: function (response) {
                                            thisRef.setProgress( (counter + 1) * 100 / (splitSize + 1));
                                            counter++;
                                        },
                                        context: this
                                    });
                                })
                            }

                            promise.done(function () {
                                thisRef.setUrl(state.uploadedUrl);

                                let payloads = rawData.payloads;
                                let size = 0;
                                let count = 0;
                                let structured = {};
                                let session = [];
                                let activeId;
                                let activeIndex = 0;
                                let activeTabId = parseInt(location.href.match(/\?tab=([0-9]*$)/)[1]);

                                // Reconstruct uncompressed clarity payload
                                for (let entry of payloads) {
                                    size += entry.length;
                                    let json = JSON.parse(uncompress(entry.payload));
                                    let tabId = entry.tabId;
                                    let id = json.envelope.impressionId;
                                    if (!(id in structured)) {
                                        structured[id] = { envelope: json.envelope, events: [] };
                                        if (tabId === activeTabId) {
                                            activeId = id;
                                        }
                                    }
                                    structured[id].events = structured[id].events.concat(json.events);
                                    count++;
                                }

                                for (let id in structured) {
                                    if (structured[id].envelope.sequenceNumber === 0) {
                                        if (activeId === id) {
                                            activeIndex = session.length;
                                        }
                                        session.push(JSON.stringify(structured[id]));
                                    }
                                }

                                state.uploaded = true;
                                chrome.storage.local.set({ clarity: state });
                            })

                            chain.resolveWith(splitLogs);
                        },
                        error: function (response) {
                            thisRef.closeShareWindow();
                            alert('Server Error Ocurred. Please try again.');
                        }
                    });
                });
            } else {
                thisRef.setProgress(100);
                thisRef.setUrl(state.uploadedUrl);
            }
        });
    }

    setProgress = (currProgress) => {
        this.setState({
            completed: currProgress
        });
    };

    setUrl = (uploadedUrl) => {
        this.setState({
            message: 'Link: ',
            url: uploadedUrl
        });
    };

    openShareWindow = () => {
        this.setState({
            open: true,
        });
    };

    closeShareWindow = () => {
        this.setState({
            open: false,
        });
    };

    render() {

        const {
            open,
            completed,
            message,
            url,
        } = this.state;

        if (!this.props.impression) {
            return (<div></div>);
        }

        this.extractFrames();
        var index = this.props.session.indexOf(this.props.impression);
        var Icon = this.props.playback ? <PauseIcon /> : <PlayIcon />;
        var speedIconColor = this.props.speed ? "white" : "#333";
        var boxmodelIconColor = this.props.boxmodel ? "white" : "#666";
        var prevIconColor = index > 0 ? "white" : "#333";
        var nextIconColor = index < (this.props.session.length - 1) ? "white" : "#333";

        var shareable = (location.href.toString().indexOf("clarity.html?tab=") != -1)
        let baseControls = <div className="clarity-controls">
            <IconButton iconStyle={{ color: "white" }} onClick={this.togglePlayback.bind(this)} >
                {Icon}
            </IconButton>
            <IconButton iconStyle={{ color: prevIconColor }} onClick={this.playImpression.bind(this, index - 1)} >
                <PrevIcon />
            </IconButton>
            <IconButton iconStyle={{ color: nextIconColor }} onClick={this.playImpression.bind(this, index + 1)} >
                <NextIcon />
            </IconButton>
            <IconButton iconStyle={{ color: speedIconColor }} onClick={this.toggleSpeed.bind(this)} >
                <TimelapseIcon />
            </IconButton>
            <IconButton iconStyle={{ color: boxmodelIconColor }} onClick={this.toggleBoxModel.bind(this)} >
                <BoxModelIcon />
            </IconButton>
            <Slider />
            <Timer />
        </div>;

        if (shareable) {
            return (
                <div className="clarity-player">
                    {baseControls}
                    <IconButton id="share-icon" touch={true} iconStyle={{ color: "white" }} onClick={this.uploadAndShare.bind(this)}>
                        <ShareIcon />
                    </IconButton>
                    <a className="share" onClick={this.uploadAndShare.bind(this)}>Upload and share</a>
                    <Dialog className="share-popup"
                        actions= {this.state.url != "" ? [
                            <FlatButton
                                className="share-popup"
                                label="Share on Facebook"
                                primary={false}
                                onClick={this.closeShareWindow}
                                target="_blank" 
                                href={"https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2F" + "www.bing.com" + "%2F&amp;src=sdkpreparse"}
                            />,
                            <CopyToClipboard className="copy-button" text={this.state.url}>
                                <FlatButton
                                    className="share-popup"
                                    label="Copy link to clipboard"
                                />
                            </CopyToClipboard>,
                            <FlatButton
                                className="share-popup"
                                label="Close"
                                primary={true}
                                onClick={this.closeShareWindow}
                            />
                            
                        ]: [<FlatButton
                                className="share-popup"
                                label="Close"
                                primary={true}
                                onClick={this.closeShareWindow}
                            />]}
                        modal={true}
                        open={open}
                        onRequestClose={this.closeShareWindow}>
                        <div className="share-popup">
                            {this.state.url != "" ? 'Upload Finished! Share: ' : 'Uploading... '}
                            <br />
                            <br />
                            <LinearProgress mode="determinate" value={this.state.completed} />
                            <br />
                            {this.state.message}<a href={this.state.url} target="_blank">{this.state.url}</a>
                        </div>
                    </Dialog>
                </div>
            );
        } else {
            return (
                <div className="clarity-player">
                    {baseControls}
                    <img className="clarity-logo" src="/clarity.png" alt="Clarity"></img>
                </div>
            );
        }
    }

    componentWillUnmount() {
        if (this.setTimeoutId > 0) {
            clearTimeout(this.setTimeoutId);
        }
    }

    componentDidUpdate() {
        let drawer = document.querySelector(".clarity-drawer > div");
        let active = document.querySelector(".active-step");
        if (drawer && active && active.parentElement && active.parentElement.parentElement && active.parentElement.parentElement.parentElement) {
            drawer.scrollTop = active.parentElement.parentElement.parentElement.offsetTop;    
        }
    }
}

// Connnecting Slider container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => {
        return {
            session: state.session,
            playlist: state.playlist,
            impression: state.impression,
            snapshot: state.snapshot,
            playback: state.playback,
            speed: state.speed,
            boxmodel: state.boxmodel
        }
    },
    dispatch => { return bindActionCreators({ 
        selectSnapshot: selectSnapshot, 
        togglePlayback: togglePlayback, 
        toggleSpeed: toggleSpeed, 
        toggleBoxModel: toggleBoxModel, 
        selectImpression: selectImpression 
    }, dispatch) }
)(Player);