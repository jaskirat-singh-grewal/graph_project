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
    } else if (boxContent.resultBoxes.includes(i)) {
      className = "resultBox";
    } else if (boxContent.wallBoxes.includes(i)) {
      className = "wallBox";
    } else if (boxContent.transitionBoxes.includes(i)) {
      className = "transitionBox";
    } else if (boxContent.coveredBoxes.includes(i)) {
      className = "coveredBox";
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
        onPointerDown={() => this.props.onPointerDown(i)}
        onPointerEnter={() => this.props.onPointerEnter(i)}
        onPointerUp={() => this.props.onPointerUp(i)}
      />
    );
  }

  render() {
    const ROW = this.props.rows,
      COL = this.props.cols;
    const arrRow = Array(ROW).fill(null),
      arrCol = Array(COL).fill(null);
    console.log("boxContent from Grid: ", this.props.boxContent);
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
