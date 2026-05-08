import React, { Component } from "react";
import Box from "./Box";
import { tintForStart } from "../cellModel";

// ownerStart sentinel for the end-side wave in Bidirectional Search.
// Rendered with a distinct neutral tint so the user can tell forward and
// backward fronts apart visually.
const END_WAVE_OWNER = -2;
const END_WAVE_TINT = "#cdd2e6";

const buildWallColorMap = (wallTypes) => {
  const m = {};
  for (const w of wallTypes) m[w.id] = w.color;
  return m;
};

class Grid extends Component {
  renderBox(idx) {
    const { cells, starts, ends, exploredOwner, frontierOwner, pathSet, wallTypes, cellW, cellH } = this.props;

    let role = "empty";
    let bgOverride = null;
    let glyph = null;

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
      bgOverride =
        exploredOwner[idx] === END_WAVE_OWNER
          ? END_WAVE_TINT
          : tintForStart(exploredOwner[idx]);
    }
    if (frontierOwner[idx] !== -1 && role !== "wall") {
      role = "frontier";
      bgOverride =
        frontierOwner[idx] === END_WAVE_OWNER
          ? END_WAVE_TINT
          : tintForStart(frontierOwner[idx]);
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
        cellW={cellW}
        cellH={cellH}
        role={role}
        bgOverride={bgOverride}
        glyph={glyph}
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
      <div className="grid-row" key={indexRow}>
        {arrCol.map((_, indexCol) => this.renderBox(indexRow * COL + indexCol))}
      </div>
    ));
    return <div className="grid-wrap" onPointerLeave={this.props.onPointerUp}>{boxRows}</div>;
  }
}
export default Grid;
