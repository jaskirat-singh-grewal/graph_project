import React, { Component } from "react";
import Box from "./Box";

class Grid extends Component {
  renderBox(i) {
    let className;
    let { boxContent } = this.props;
    if (boxContent.startBoxIndex === i) {
      className = "startBox";
    } else if (boxContent.endBoxIndex === i) {
      className = "endBox";
    } else if (boxContent.transitionBoxes.indexOf(i) > -1) {
      className = "transitionBox";
    } else if (boxContent.coveredBoxes.indexOf(i) > -1) {
      className = "coveredBox";
    } else if (boxContent.resultBoxes.indexOf(i) > -1) {
      className = "resultBox";
    } else {
      className = "box";
    }
    return (
      <Box
        key={i}
        id={i}
        className={className}
        value={this.props.boxContent.box[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    const ROW = this.props.rows,
      COL = this.props.cols;
    const arrRow = Array(ROW).fill(null),
      arrCol = Array(COL).fill(null);
    const boxRows = arrRow.map((box, indexRow) => {
      return (
        <div className="grid-row" id={indexRow} key={indexRow}>
          {arrCol.map((box, indexCol) => {
            return this.renderBox(indexRow * COL + indexCol);
          })}
        </div>
      );
    });

    return <div>{boxRows}</div>;
  }
}
export default Grid;
