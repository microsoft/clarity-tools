import * as React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import { Step, Stepper, StepButton, StepContent } from "material-ui/Stepper";
import { selectImpression } from "../actions";
import ImpressionIcon from 'material-ui/svg-icons/action/description';
import UserIcon from 'material-ui/svg-icons/social/person';
import LinkIcon from 'material-ui/svg-icons/social/public';
import DateIcon from 'material-ui/svg-icons/action/today';

class Session extends React.Component<any, any> {
    getHostname(url) {
        let a = document.createElement("a");
        a.href = url;
        return a.hostname;
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
        return this.props.session.map((impression) => {
            let active = impression.envelope.impressionId === this.props.impression.envelope.impressionId;
            let dateTime = new Date(impression.envelope.dateTime);
            let url = impression.envelope.url;
            let vertical = impression.envelope.vertical ? impression.envelope.vertical : null;
            let time = dateTime.toLocaleString('en-US', { hour: 'numeric', minute:'numeric', second:'numeric', hour12: false });
            let title = (impression.envelope.title ? impression.envelope.title : this.getHostname(impression.envelope.url));
            let header = vertical ? `${time} // ${vertical}` : time;
            let disabled = !!impression.envelope.disabled;
            let stepContent = null;
            let infoItems = [];
            let contentStyles = { paddingLeft: 0, paddingRight: 0 };
            if (active) {
                if (impression.envelope.date) infoItems.push({title: impression.envelope.date, icon: DateIcon});
                //infoItems.push({title: impression.envelope.impressionGuid || impression.envelope.impressionId.toUpperCase(), icon: ImpressionIcon});
                //infoItems.push({title: impression.envelope.clientId || impression.envelope.clarityId.toUpperCase(), icon: UserIcon});
                infoItems.push({title: <a href={impression.envelope.url} target="_blank">Link</a>, icon: LinkIcon});
            }
            let stepClassName = active ? "clarity-steptitle active-step" : "clarity-steptitle";

            return (
                <Step key={impression.envelope.impressionId} active={active}>
                    <StepButton onClick={() => this.props.selectImpression(impression)} disabled={disabled}>
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
        });
    }

    render() {
        if (!this.props.impression) {
            return (<div></div>);
        }

        let CustomStepper : any = Stepper;
        return (
            <div style={{width: '100%', whiteSpace: 'nowrap', overflow: 'auto'}}>
                <CustomStepper linear={false} activeStep={0} orientation="vertical">
                    {this.renderSession()}
                    <Step>
                        <StepButton disabled={true}>
                            End of session
                        </StepButton>
                    </Step>
                </CustomStepper>
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
            impression: state.impression
        }
    },
    dispatch => { return bindActionCreators({ selectImpression: selectImpression }, dispatch) }
)(Session);