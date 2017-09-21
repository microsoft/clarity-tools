import * as React from "react";
import * as ReactDOM from "react-dom";
import { connect } from "react-redux";
import Layout from "../parsers/layout";
import BoxModel from "../parsers/boxmodel";
import Viewport from "../parsers/viewport";
import Pointer from "../parsers/pointer";

export interface IParser {
  setup(document, frame, base, thumbnail? : boolean): void;
  render(state): void;
}

class Snapshot extends React.Component<any, any> {

  private frame: HTMLIFrameElement;
  private parsers: { [type: string]: IParser } = {};
  private activeImpressionId = "";
  private activeFullPageSetting = false;
  private currentTime = 0;
  private currentPointer = -1;

  visualize() {
    if (this.props.snapshot) {
      this.frame = ReactDOM.findDOMNode(this) as HTMLIFrameElement;
      var time = this.props.snapshot;
      var events = this.props.impression.events;
      var start = events[0].time;
      var end = events[events.length - 1].time;

      // Reset all parsers if this is the first time an impression is rendered
      if (this.activeImpressionId != this.props.impression.envelope.impressionId) {
        for (var type in this.parsers) {
          this.parsers[type].setup(this.frame.contentDocument, this.frame, this.props.base);
        }
        this.activeImpressionId = this.props.impression.envelope.impressionId;

        // Fast forward to the end of the impression to show summary view
        time = end;
        this.currentTime = 0;
        this.currentPointer = -1;
      }
      else {
        // Even if it's not a different impression, refresh the viewport regardless
        this.parsers["Viewport"].setup(this.frame.contentDocument, this.frame, this.props.base);
      }
      
      var startPointer = time < this.currentTime ? 0 : this.currentPointer + 1;
      for (var i = startPointer; i < events.length; i++) {
        var event = events[i];
        if (event.time <= time) {
          let parser = event.type === "Layout" && this.props.boxmodel ? "BoxModel" : event.type; 
          if (parser in this.parsers) {
            this.parsers[parser].render(event.state);
          }
          this.currentPointer = i;
        }
        else break;
      }

      this.currentTime = time;
    }
  }

  componentWillMount() {
    this.parsers = {
      Layout: new Layout(),
      BoxModel: new BoxModel(),
      Viewport: new Viewport(),
      Pointer: new Pointer()
    }
  }

  render() {
    if (!this.props.snapshot) {
      return (<div>Waiting for the api response...</div>);
    }
    else {
      var width = window.innerWidth - 50;
      return (
        <iframe scrolling="no" width={width} data-fullpage={this.props.fullpage} />
      );
    }
  }

  componentDidMount() {
    this.visualize();
  }

  componentDidUpdate() {
    this.visualize();
  }

  componentWillUnmount() {
    var frame = ReactDOM.findDOMNode(this) as HTMLIFrameElement;
    ReactDOM.unmountComponentAtNode(frame.contentDocument.documentElement);
    this.parsers = {};
  }
}

// Connnecting Impression container with the redux store
// mapStateToProps and matchDispatchToProps using fat arrow function
export default connect(
  state => {
    return {
      snapshot: state.snapshot,
      impression: state.impression,
      boxmodel: state.boxmodel,
      fullpage: state.fullpage,
      base: state.impression ? state.impression.envelope.url.match(/^(.*\/)[^\/]*$/)[1] : ""
    }
  })(Snapshot);