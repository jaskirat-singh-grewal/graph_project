import React, { Component } from "react";
import Box from "./Box";
import { tintForStart } from "../cellModel";

const buildWallColorMap = (wallTypes) => {
  const m = {};
  for (const w of wallTypes) m[w.id] = w.color;
  return m;
};

class Grid extends Component {
  renderBox(idx, coli) {
    const { cells, starts, ends, exploredOwner, frontierOwner, pathSet, wallTypes } = this.props;
    const allBoxOffset = Math.floor(this.props.sizeOffset / this.props.cols);
    const offsetBool = coli < (this.props.sizeOffset % this.props.cols) - 1;

    let role = "empty";
    let bgOverride = null;
    let glyph = null;
    let ownerStart = -1;

    const startIdx = starts.indexOf(idx);
    const endIdx = ends.indexOf(idx);
    const cell = cells[idx];

    // Layered rendering: terrain at the bottom, then explored/frontier overlay,
    // then result path, then start/end markers on top.
    if (cell.terrainId) {
      const colorMap = this._wallColorMap || (this._wallColorMap = buildWallColorMap(wallTypes));
      role = "wall";
      bgOverride = colorMap[cell.terrainId] || "#444";
    }

    if (exploredOwner[idx] !== -1 && role !== "wall") {
      role = "explored";
      ownerStart = exploredOwner[idx];
      bgOverride = tintForStart(ownerStart);
    }
    if (frontierOwner[idx] !== -1 && role !== "wall") {
      role = "frontier";
      ownerStart = frontierOwner[idx];
      bgOverride = tintForStart(ownerStart);
    }

    if (pathSet.has(idx)) {
      role = "path";
      bgOverride = "#ffd400";
    }

    if (startIdx !== -1) {
      role = "start";
      bgOverride = tintForStart(startIdx);
      glyph = String(startIdx + 1);
    } else if (endIdx !== -1) {
      role = "end";
      bgOverride = "#ffffff";
      glyph = "★";
    }

    return (
      <Box
        key={idx}
        id={idx}
        boxSize={this.props.boxSize}
        allBoxOffset={allBoxOffset}
        offsetBool={offsetBool}
        role={role}
        bgOverride={bgOverride}
        glyph={glyph}
        onClick={() => this.props.onClick(idx)}
        onPointerDown={() => this.props.onPointerDown(idx)}
        onPointerEnter={() => this.props.onPointerEnter(idx)}
        onPointerUp={() => this.props.onPointerUp(idx)}
      />
    );
  }

  render() {
    // Reset memoized color map on every render so wall-type changes propagate.
    this._wallColorMap = null;
    const ROW = this.props.rows, COL = this.props.cols;
    const arrRow = Array(ROW).fill(null);
    const arrCol = Array(COL).fill(null);
    const boxRows = arrRow.map((_, indexRow) => (
      <div className="grid-row" id={indexRow} key={indexRow}>
        {arrCol.map((_, indexCol) => this.renderBox(indexRow * COL + indexCol, indexCol))}
      </div>
    ));
    return <div className="grid-wrap" onPointerLeave={this.props.onPointerUp}>{boxRows}</div>;
  }
}
export default Grid;
