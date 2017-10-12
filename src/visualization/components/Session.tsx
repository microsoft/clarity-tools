import * as React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { List, ListItem } from 'material-ui/List';
import { Step, Stepper, StepButton, StepContent } from "material-ui/Stepper";
import { selectImpression, toggleInactiveSession } from "../actions";
import ImpressionIcon from 'material-ui/svg-icons/action/description';
import UserIcon from 'material-ui/svg-icons/social/person';
import LinkIcon from 'material-ui/svg-icons/social/public';
import DateIcon from 'material-ui/svg-icons/action/today';
import Toggle from 'material-ui/Toggle';

class Session extends React.Component<any, any> {
    getHostname(url) {
        let a = document.createElement("a");
        a.href = url;
        return a.hostname;
    } 

    toggleInactiveSession() {
        this.props.toggleInactiveSession(!this.props.inactive);
    }

    getListItems(infoItems) {
        let iconStyles = { left: 0, width: 20, height: 20, margin: 6 };
        let listStyles = { fontSize: "10px", padding: "8px 16px 8px 28px" };
        let count = 0;
        return infoItems.map((item) => {
            return (
                <ListItem key={count++} leftIcon={<item.icon style={iconStyles} />} disabled={true} innerDivStyle={listStyles}>
                    {item.title}
                </ListItem>
            );
        });
    }

    renderSession() {
        let count = 0;
        let sessionMarkup = [];
        this.props.session.map((impression) => {
            let active = impression.metadata.impressionId === this.props.impression.metadata.impressionId;
            let dateTime = new Date(impression.metadata.dateTime);
            let url = impression.metadata.url;
            let vertical = impression.metadata.vertical ? impression.metadata.vertical : null;
            let time = dateTime.toLocaleString('en-US', { hour: 'numeric', minute:'numeric', second:'numeric', hour12: false });
            let title = (impression.metadata.title ? impression.metadata.title : this.getHostname(impression.metadata.url));
            let header = vertical ? `${time} // ${vertical}` : time;
            let disabled = !!impression.metadata.disabled;
            let stepContent = null;
            let infoItems = [];
            let contentStyles = { paddingLeft: 0, paddingRight: 0 };
            if (active) {
                if (impression.metadata.date) infoItems.push({title: impression.metadata.date, icon: DateIcon});
                infoItems.push({title: impression.metadata.impressionGuid || impression.metadata.impressionId.toUpperCase(), icon: ImpressionIcon});
                infoItems.push({title: impression.metadata.clientId || impression.metadata.clarityId.toUpperCase(), icon: UserIcon});
                infoItems.push({title: <a href={url} target="_blank">Link</a>, icon: LinkIcon});
            }
            let stepClassName = active ? "clarity-steptitle active-step" : "clarity-steptitle";
            count++;
            if (!(this.props.inactive && disabled)) {
                sessionMarkup.push(
                    <Step key={impression.metadata.impressionId} active={active}>
                        <StepButton onClick={() => this.props.selectImpression(impression)} icon={count} disabled={disabled}>
                            <div className={stepClassName}>
                                <span title={url}>{title}</span>
                                <br/>
                                <span className={"clarity-steptime"}>
                                    {header}
                                </span>
                            </div>
                        </StepButton>
                        <StepContent style={contentStyles}>
                            <List>
                                {this.getListItems(infoItems)}
                            </List>
                        </StepContent>
                    </Step>
                );
            }
        });
        return sessionMarkup;
    }

    render() {
        if (!this.props.impression) {
            return (<div></div>);
        }

        let CustomStepper : any = Stepper;
        let toggleSwitch = <div/>;

        // Check if there are disabled pages in the session
        for (let impression of this.props.session) {
            if (!!impression.metadata.disabled) {
                toggleSwitch = (
                    <div className="clarity-toggle">
                            <Toggle label="Hide Inactive Pages" defaultToggled={this.props.inactive} onToggle={this.toggleInactiveSession.bind(this)}/>
                    </div>
                );
                break;
            }
        } 

        return (
            <div className="clarity-session">
                <div style={{width: '100%', whiteSpace: 'nowrap', overflow: 'auto'}}>
                    {toggleSwitch}
                    <CustomStepper linear={false} activeStep={0} orientation="vertical">
                        {this.renderSession()}
                        <Step>
                            <StepButton icon={this.props.session.length + 1} disabled={true}>
                                End of session
                            </StepButton>
                        </Step>
                    </CustomStepper>
                </div>
            </div>
        );
    }

}

// Connnecting Slider container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
    state => {
        return {
            session: state.session,
            impression: state.impression,
            inactive: state.inactive
        }
    },
    dispatch => { return bindActionCreators({ selectImpression: selectImpression, toggleInactiveSession: toggleInactiveSession }, dispatch) }
)(Session);