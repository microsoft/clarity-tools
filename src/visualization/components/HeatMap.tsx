import * as React from "react";
import { connect } from "react-redux";

class HeatMap extends React.Component<any, any> {
  //TODO : compute the parameters for max and radius dynamically based on data
  drawheatmap() {
    if (this.props.heatmapdata) {
      var simpleheat = require('simpleheat');
      let data = this.props.heatmapdata["heatmapdata"];
      let heatmap = simpleheat('canvas').data(data).max(20);
      heatmap.radius(15,5);
      heatmap.draw();
    }
  }

  componentDidMount() {
    this.drawheatmap();
  }

  componentDidUpdate() {
    this.drawheatmap();
  }

  render() {
      let data = this.props.heatmapdata;
      var canvasStyle = data ? {
        width: data["devicewidth"],
        height: data["deviceheight"],
        position: 'absolute',
        zIndex: 2
      } : null;

      let Content = data ? <canvas id="canvas" width={data["devicewidth"]} height={data["deviceheight"]} style={canvasStyle}></canvas> : <div />;
      return (
        <div>
              { Content }
        </div>
      );
    };
}

export default connect(
    state => { return { impression: state.impression, heatmapdata: state.heatmap }}
)(HeatMap);
