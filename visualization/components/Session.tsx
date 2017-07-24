import * as React from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Step, Stepper, StepButton } from "material-ui/Stepper";
import { selectImpression } from "../actions";
import NextIcon from 'material-ui/svg-icons/navigation/chevron-right';

class Session extends React.Component<any, any> {
    getHostname(url) {
        var a = document.createElement("a");
        a.href = url;
        return a.hostname;
    } 

    renderSession() {
        return this.props.session.map((impression) => {
            var active = impression.envelope.impressionId === this.props.impression.envelope.impressionId;
            var dateTime = new Date(impression.envelope.time);
            var title = (impression.envelope.title ? impression.envelope.title : this.getHostname(impression.envelope.url));
            return (
                <Step key={impression.envelope.impressionId} active={active}>
                    <StepButton onClick={() => this.props.selectImpression(impression)}>
                    {title}
                    </StepButton>
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
                <CustomStepper linear={false} activeStep={0} connector={<NextIcon />} style={{placeContent: 'flex-start'}}>
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