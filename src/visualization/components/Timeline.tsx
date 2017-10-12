import * as React from "react";
import { connect } from "react-redux";
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import StarIcon from 'material-ui/svg-icons/toggle/star';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import { Step, Stepper, StepButton, StepContent } from "material-ui/Stepper";
import { deepOrange300, purple500, red500, yellow300 } from 'material-ui/styles/colors';
import { bindActionCreators } from "redux";
import { selectSnapshot } from "../actions";

interface IEventGroup {
    sequence: number;
    start: number;
    end: number;
    pointer: number;
    type: string;
    subtype: string;
    count: number;
    bytes: number;
}

interface ISummary {
    title: string;
    subtitle: string;
    time: number;
    type: string;
    json?: string[];
    
}

class Timeline extends React.Component<any, any> {
    private color = {
        "L": "teal",
        "V": "green",
        "P": "blue",
        "R": "purple",
        "N": "orange"
    }
    formatTime(time: number) {
        var milliseconds = Math.round((time % 1000) / 10);
        var seconds = Math.round((time / 1000) % 60);
        var minutes = Math.round((time / (1000 * 60)) % 60);
        var hours = Math.round((time / (1000 * 60 * 60)) % 24);

        var millisecondsText = (milliseconds < 10) ? "0" + milliseconds + "0" : milliseconds + "0";
        var hoursText = (hours < 10) ? "0" + hours : hours;
        var minutesText = (minutes < 10) ? "0" + minutes : minutes;
        var secondsText = (seconds < 10) ? "0" + seconds : seconds;

        if (time < 1000) {
            return `${time}ms`;
        }
        else if (time < 60 * 1000) {
            return `${seconds}.${milliseconds}s`;
        }

        return `${hoursText}:${minutesText}:${secondsText}.${millisecondsText}`;
    }

    formatBytes(bytes: number) {
        var simplebytes = Math.floor((bytes % 1024) / 10);
        var kilobytes = Math.floor((bytes / 1024) % 1024);
        var megabytes = Math.floor((bytes / (1024 * 1024)) % 1024);

        if (megabytes > 0) {
            return `${megabytes}.${kilobytes} MB`;
        }
        else if (kilobytes > 0) {
            return `${kilobytes}.${simplebytes} KB`;
        }
        else {
            return `${bytes} bytes`;
        }
    }

    getSubtitle(summary: IEventGroup, showtime: boolean) {
        var strEvent = summary.count > 1 ? "events" : "event";
        let duration = summary.end - summary.start > 1 ? ` (${this.formatTime(Math.max(summary.end - summary.start, 1))})` : "";
        return `${showtime ? this.formatTime(summary.end) + `${duration}: ` : ""}${summary.count} ${strEvent} // ${this.formatBytes(summary.bytes)}`;
    }

    getSubtype(event) {
        switch (event.type) {
            case "Layout":
                return event.state.source === 0 ? "discover" : "mutation";
            case "Viewport":
            case "Pointer":
                return event.state.event;
            case "Instrumentation":
                switch (event.state.type) {
                    case 0: return "asynchronous";
                    case 1: return "largetask";
                    case 2: return "jserror";
                    case 3: return "apimissing";
                    case 4: return "xhrerror";
                    case 5: return "bytelimit";
                    default: return "unknown";
                }
            default:
                return "";
        }
    }

    grouping() {
        let output: IEventGroup[] = [];
        let envelope = this.props.impression.metadata;
        let events = this.props.impression.events;
        let lastSequence = -1;
        let pointer = 0;

        // Walk through different entries of summary information
        for (let entry of envelope.summary) {
            let limit = pointer + entry.events;
            let summary: IEventGroup = null;
            let totalBytes = 0;

            for (let i = pointer; i < limit; i++) {
                let type = events[i].type;
                let subtype = this.getSubtype(events[i]);
                let bytes = JSON.stringify(events[i]).length;
                
                if (summary === null || !(summary.type === type && summary.subtype === subtype)) {
                    if (summary) output.push(summary);
                    summary = {
                        sequence: entry.sequenceNumber,
                        start: events[i].time,
                        end: events[i].time,
                        pointer: i,
                        type: type,
                        subtype: subtype,
                        count: 1,
                        bytes: bytes
                    }
                } else {
                    summary.end = events[i].time;
                    summary.count += 1;
                    summary.bytes += bytes;
                }

                totalBytes += bytes;
            }
            if (summary) output.push(summary);

            // Upload summary
            output.push({
                sequence: entry.sequenceNumber,
                start: events[pointer].time,
                end: events[limit - 1].time,
                pointer: pointer,
                type: "Clarity",
                subtype: (entry.sequenceNumber - lastSequence !== 1) ? "error" : "upload",
                count: limit - pointer,
                bytes: totalBytes
            });

            pointer = limit;
            lastSequence = entry.sequenceNumber;
        }
        return output;
    }

    process(group): ISummary {
        let json = [];
        let events = this.props.impression.events;
        for (var i = group.pointer; i < group.pointer + group.count; i++) {
            json.push(events[i]);
        }
        return {
            "title": group.subtype ? `${group.type}: ${group.subtype}` : `${group.type}`,
            "subtitle": this.getSubtitle(group, true),
            "json": json,
            "type": group.type,
            "time": group.end,
        }
    }

    renderJSON(jsonList) {
        var output = [];
        const style = {
            json: {
                marginLeft: 20,
                fontSize: 10,
                lineHeight: 0.9
            }
        }
        for (var i = 0; i < jsonList.length; i++) {
            var json = jsonList[i];
            output.push(<ListItem key={i + ".JSON"} style={style.json} disabled={true}><pre className="clarity-json">{json}</pre></ListItem>);
        }
        return output;
    }
    
    selectSummary(time, json) {
        window["clarity"] = { "events": json };
        this.props.selectSnapshot(time);
    }
    
    renderTimeline() {
        let groups = this.grouping();
        let contentStyles = { paddingLeft: 0, paddingRight: 0 };
        let stepClassName = "clarity-steptitle";
        let steps = [
            <Step key={"0.Init"} disabled={true}>
                <StepButton icon={<Avatar size={25} backgroundColor="black" icon={<StarIcon />}></Avatar>}>
                    <div className={stepClassName}>
                        <span>Initialized clarity</span>
                        <br/>
                        <span className={"clarity-steptime"}>
                            {"Version: " + this.props.impression.metadata.version}
                        </span>
                    </div>
                </StepButton>
            </Step>
        ];

        for (let i = 0; i < groups.length; i++) {
            let entry = this.process(groups[i]);
            let code = groups[i].type.substr(0, 1);
            stepClassName = "clarity-steptitle";
            let avatar = <Avatar backgroundColor={code in this.color ? this.color[code] : "gray"} size={25}>{code}</Avatar>;
            let key = `${i}`;

            if (entry.type === "Clarity") {
                avatar = <Avatar size={25} backgroundColor="black">{groups[i].sequence + 1}</Avatar>;
            }

            if (entry.type === "error") {
                key = `${key}.ERR`;
                avatar = <Avatar size={25} color={yellow300} backgroundColor={red500} icon={<WarningIcon />}></Avatar>;
            }

            let listItem = entry.json ? 
                    <ListItem key={`${key}.Item`} leftAvatar={avatar} primaryText={entry.title} secondaryText={entry.subtitle} disabled={true} initiallyOpen={false} primaryTogglesNestedList={true} nestedItems={this.renderJSON(entry.json)} /> :
                    <ListItem key={`${key}.Item`} leftAvatar={avatar} primaryText={entry.title} secondaryText={entry.subtitle} disabled={true} />;
            
            steps.push(
            <Step key={key}>
                <StepButton icon={avatar} onClick={() => this.selectSummary(groups[i].start, entry.json)}>
                    <div className={stepClassName}>
                        <span>{entry.title}</span>
                        <br/>
                        <span className={"clarity-steptime"}>
                            {entry.subtitle}
                        </span>
                    </div>
                </StepButton>
            </Step>);
        }

        return steps;
    }

    render() {

        if (!this.props.impression) {
            return (<div></div>);
        }

        let CustomStepper : any = Stepper;
        return (
            <div className="clarity-timeline">
                <div style={{width: '100%', whiteSpace: 'nowrap', overflow: 'hidden'}}>
                    <CustomStepper linear={false} orientation="vertical">
                        {this.renderTimeline()}
                    </CustomStepper>
                </div>
            </div>
        );
    }
}

// Connnecting Slider container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => { return { impression: state.impression } },
    dispatch => { return bindActionCreators({ selectSnapshot: selectSnapshot }, dispatch) }
)(Timeline);