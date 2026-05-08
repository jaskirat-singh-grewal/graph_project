import React, { Component } from "react";
import "../style/Graph.css";
import Grid from "./Grid";
import ControlPanel from "./ControlPanel";
import {
  DEFAULT_WALL_TYPES,
  HARD_WALL_ID,
  INF,
  makeEmptyCells,
  tintForStart,
} from "../cellModel";
import { runAlgorithm, ALGORITHMS } from "../algorithms";

// Initial fallback dims; resize() recomputes once the layout is measured.
const INITIAL_ROW = 22;
const INITIAL_COL = 48;

// Target cell footprint for picking row/col counts. Cells are then sized to
// tile the container exactly (so neither width nor height leaves a gap).
const TARGET_CELL = 28;

// Default + bounds for the resizable left panel.
const PANEL_DEFAULT = 280;
const PANEL_MIN = 200;

const initialState = (rows, cols) => ({
  cells: makeEmptyCells(rows, cols),
  starts: [],
  ends: [],
  // Per-cell render state during/after a run.
  //   exploredOwner[i] -> ownerStart index (closed cells)
  //   frontierOwner[i] -> ownerStart index (active wave cells)
  //   pathSet          -> Set<idx> of winning path cells
  exploredOwner: new Array(rows * cols).fill(-1),
  frontierOwner: new Array(rows * cols).fill(-1),
  pathSet: new Set(),
});

class Graph extends Component {
  constructor(props) {
    super(props);
    this.dragTool = null;       // active tool while pointer is held
    this.cancelRequested = false;
    this.gridRef = React.createRef();
    this.state = {
      ...initialState(INITIAL_ROW, INITIAL_COL),
      row: INITIAL_ROW,
      col: INITIAL_COL,
      cellW: 28,
      cellH: 28,
      inProgress: false,
      speedTimer: 35,
      tool: "start",
      wallTypes: DEFAULT_WALL_TYPES.slice(),
      maxStarts: 1,
      maxEnds: 1,
      panelWidth: PANEL_DEFAULT,
      status: "Place your start point — pick another tool from the panel to draw walls or set the end.",
      winnerInfo: null,
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.resize);
    if (typeof ResizeObserver !== "undefined" && this.gridRef.current) {
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this.gridRef.current);
    }
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resize);
    if (this.ro) this.ro.disconnect();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.algorithm !== this.props.algorithm) {
      this.softResetRun();
      // If the new algo is unweighted, fall the wall tool back to Hard Wall
      // when a custom/weighted terrain was selected.
      const meta = ALGORITHMS[this.props.algorithm];
      if (meta && !meta.weighted) {
        const wt = this.state.wallTypes.find((w) => w.id === this.state.tool);
        if (wt && !wt.builtin) this.setState({ tool: HARD_WALL_ID });
      }
    }
  }

  setPanelWidth = (w) => this.setState({ panelWidth: w });

  resize = () => {
    // Pick row/col counts that fill the .graph-grid container at TARGET_CELL,
    // then size cells to tile exactly — so neither right nor bottom shows a gap.
    const node = this.gridRef.current;
    if (!node) return;
    const cs = window.getComputedStyle(node);
    const padL = parseFloat(cs.paddingLeft) || 0;
    const padR = parseFloat(cs.paddingRight) || 0;
    const padT = parseFloat(cs.paddingTop) || 0;
    const padB = parseFloat(cs.paddingBottom) || 0;
    const innerW = node.clientWidth - padL - padR;
    const innerH = node.clientHeight - padT - padB;
    if (innerW <= 0 || innerH <= 0) return;

    const cols = Math.max(10, Math.floor(innerW / TARGET_CELL));
    const rows = Math.max(8, Math.floor(innerH / TARGET_CELL));
    const cellW = Math.floor(innerW / cols);
    const cellH = Math.floor(innerH / rows);

    if (cols !== this.state.col || rows !== this.state.row) {
      // State arrays' length is wrong — wipe the board.
      this.cancelRequested = true;
      this.setState((s) => ({
        ...initialState(rows, cols),
        row: rows,
        col: cols,
        cellW,
        cellH,
        inProgress: false,
        speedTimer: s.speedTimer,
        tool: s.tool,
        wallTypes: s.wallTypes,
        maxStarts: s.maxStarts,
        maxEnds: s.maxEnds,
        panelWidth: s.panelWidth,
        status: "Grid resized — board cleared. Place a new start point.",
        winnerInfo: null,
      }));
    } else if (cellW !== this.state.cellW || cellH !== this.state.cellH) {
      this.setState({ cellW, cellH });
    }
  };

  // ---- Tool / palette plumbing ----------------------------------------------

  setTool = (tool) => this.setState({ tool });

  addWallType = (wt) =>
    this.setState((s) => ({ wallTypes: [...s.wallTypes, wt], tool: wt.id }));

  removeWallType = (id) =>
    this.setState((s) => {
      const cells = s.cells.map((c) =>
        c.terrainId === id ? { terrainId: null, weight: 1 } : c
      );
      const tool = s.tool === id ? "erase" : s.tool;
      return { wallTypes: s.wallTypes.filter((w) => w.id !== id), cells, tool };
    });

  setMaxStarts = (n) =>
    this.setState((s) => {
      const starts = s.starts.slice(0, n);
      return { maxStarts: n, starts };
    });

  setMaxEnds = (n) =>
    this.setState((s) => {
      const ends = s.ends.slice(0, n);
      return { maxEnds: n, ends };
    });

  setSpeed = (v) => this.setState({ speedTimer: v });

  clearWalls = () =>
    this.setState((s) => ({
      cells: makeEmptyCells(s.row, s.col),
      exploredOwner: new Array(s.row * s.col).fill(-1),
      frontierOwner: new Array(s.row * s.col).fill(-1),
      pathSet: new Set(),
      winnerInfo: null,
      status: "Walls cleared.",
    }));

  // ---- Cell editing ---------------------------------------------------------

  applyTool = (idx, isClick) => {
    if (this.state.inProgress) return;
    const tool = this.state.tool;
    const { starts, ends, wallTypes, cells, maxStarts, maxEnds } = this.state;

    if (tool === "start") {
      if (cells[idx].weight === INF) return;
      // Clicking an already-placed start REMOVES it (toggle).
      if (starts.includes(idx)) {
        const nextStarts = starts.filter((s) => s !== idx);
        this.setState({
          starts: nextStarts,
          status: `Start removed — ${nextStarts.length}/${maxStarts} placed.`,
        });
        return;
      }
      // Clicking an existing end with the start tool just no-ops (don't shadow).
      if (ends.includes(idx)) return;
      let nextStarts = starts.slice();
      if (nextStarts.length >= maxStarts) nextStarts.shift(); // FIFO replace
      nextStarts.push(idx);
      this.setState({
        starts: nextStarts,
        status:
          nextStarts.length < maxStarts
            ? `Start ${nextStarts.length}/${maxStarts} placed. Place another start, switch tools, or hit Run.`
            : "All starts placed. Switch to End or a wall tool.",
      });
      return;
    }

    if (tool === "end") {
      if (cells[idx].weight === INF) return;
      // Clicking an already-placed end REMOVES it (toggle).
      if (ends.includes(idx)) {
        const nextEnds = ends.filter((e) => e !== idx);
        this.setState({
          ends: nextEnds,
          status: `End removed — ${nextEnds.length}/${maxEnds} placed.`,
        });
        return;
      }
      if (starts.includes(idx)) return;
      let nextEnds = ends.slice();
      if (nextEnds.length >= maxEnds) nextEnds.shift();
      nextEnds.push(idx);
      this.setState({
        ends: nextEnds,
        status:
          nextEnds.length < maxEnds
            ? `End ${nextEnds.length}/${maxEnds} placed.`
            : "All ends placed. Draw walls or hit Run.",
      });
      return;
    }

    if (tool === "erase") {
      const newCells = cells.slice();
      if (newCells[idx].terrainId !== null) {
        newCells[idx] = { terrainId: null, weight: 1 };
      }
      const nextStarts = starts.filter((s) => s !== idx);
      const nextEnds = ends.filter((e) => e !== idx);
      this.setState({ cells: newCells, starts: nextStarts, ends: nextEnds });
      return;
    }

    // Otherwise it's a wall-type id. Paint terrain.
    const wt = wallTypes.find((w) => w.id === tool);
    if (!wt) return;
    if (starts.includes(idx) || ends.includes(idx)) return;
    if (cells[idx].terrainId === wt.id) return;
    const newCells = cells.slice();
    newCells[idx] = { terrainId: wt.id, weight: wt.weight };
    this.setState({ cells: newCells });
  };

  onCellPointerDown = (idx) => {
    this.dragTool = this.state.tool;
    this.applyTool(idx, true);
  };

  onCellPointerEnter = (idx) => {
    if (this.dragTool == null) return;
    if (this.dragTool === "start" || this.dragTool === "end") return;
    this.applyTool(idx, false);
  };

  onCellPointerUp = () => {
    this.dragTool = null;
  };

  // ---- Running --------------------------------------------------------------

  softResetRun = () => {
    this.setState((s) => ({
      exploredOwner: new Array(s.row * s.col).fill(-1),
      frontierOwner: new Array(s.row * s.col).fill(-1),
      pathSet: new Set(),
      winnerInfo: null,
    }));
  };

  hardReset = () => {
    if (this.state.inProgress) {
      this.cancelRequested = true;
    }
    this.setState((s) => ({
      ...initialState(s.row, s.col),
      row: s.row,
      col: s.col,
      cellW: s.cellW,
      cellH: s.cellH,
      inProgress: false,
      speedTimer: s.speedTimer,
      tool: s.tool,
      wallTypes: s.wallTypes,
      maxStarts: s.maxStarts,
      maxEnds: s.maxEnds,
      panelWidth: s.panelWidth,
      status: "Map cleared. Place a new start point.",
    }));
  };

  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  run = async () => {
    if (this.state.inProgress) return;
    const { starts, ends, cells, row: rows, col: cols } = this.state;
    if (!starts.length) {
      this.setState({ status: "Place at least one start before running." });
      return;
    }
    if (!ends.length) {
      this.setState({ status: "Place at least one end before running." });
      return;
    }
    const algorithm = this.props.algorithm || "bfs";
    const algoMeta = ALGORITHMS[algorithm];
    this.softResetRun();
    this.cancelRequested = false;
    this.setState({
      inProgress: true,
      status: `${algoMeta.label} running… ${starts.length} source${starts.length > 1 ? "s" : ""}, ${ends.length} target${ends.length > 1 ? "s" : ""}.`,
    });

    const result = runAlgorithm(algorithm, { cells, starts, ends, rows, cols });

    // Animate frames.
    const explored = new Array(rows * cols).fill(-1);
    const frontier = new Array(rows * cols).fill(-1);
    for (const frame of result.frames) {
      if (this.cancelRequested) break;
      for (const { idx, ownerStart } of frame.newlyFrontier) {
        if (explored[idx] === -1) frontier[idx] = ownerStart;
      }
      for (const { idx, ownerStart } of frame.newlyExplored) {
        explored[idx] = ownerStart;
        frontier[idx] = -1;
      }
      this.setState({
        exploredOwner: explored.slice(),
        frontierOwner: frontier.slice(),
      });
      await this.sleep(this.state.speedTimer);
    }

    if (this.cancelRequested) {
      this.setState({ inProgress: false });
      return;
    }

    if (!result.winner) {
      this.setState({
        inProgress: false,
        status: "No path found from any start to any end.",
        winnerInfo: null,
      });
      return;
    }

    const pathSet = new Set();
    for (const idx of result.path) {
      if (this.cancelRequested) break;
      pathSet.add(idx);
      this.setState({ pathSet: new Set(pathSet) });
      await this.sleep(Math.max(15, this.state.speedTimer));
    }

    if (this.cancelRequested) {
      this.setState({ inProgress: false });
      return;
    }

    const w = result.winner;
    this.setState({
      inProgress: false,
      winnerInfo: w,
      status: `Path found! Start #${w.startIdx + 1} reached end #${ends.indexOf(w.endIdx) + 1} — length ${w.pathLength}, cost ${w.cost}.`,
    });
  };

  // ---------------------------------------------------------------------------

  render() {
    const {
      cells,
      starts,
      ends,
      exploredOwner,
      frontierOwner,
      pathSet,
      tool,
      wallTypes,
      maxStarts,
      maxEnds,
      speedTimer,
      inProgress,
      status,
      winnerInfo,
      panelWidth,
      cellW,
      cellH,
    } = this.state;
    const algorithm = this.props.algorithm || "bfs";

    return (
      <div className="graph">
        <div className="status-bar">
          <div className="status-bar-text">{status}</div>
          {winnerInfo && (
            <div className="status-bar-meta">
              <span className="meta-tag" style={{ background: tintForStart(winnerInfo.startIdx) }}>
                Start #{winnerInfo.startIdx + 1}
              </span>
              <span className="meta-num">length {winnerInfo.pathLength}</span>
              <span className="meta-num">cost {winnerInfo.cost}</span>
            </div>
          )}
        </div>
        <div className="graph-body">
          <ControlPanel
            algorithm={algorithm}
            onAlgorithmChange={this.props.onAlgorithmChange}
            tool={tool}
            onToolChange={this.setTool}
            wallTypes={wallTypes}
            onAddWallType={this.addWallType}
            onRemoveWallType={this.removeWallType}
            maxStarts={maxStarts}
            maxEnds={maxEnds}
            placedStarts={starts.length}
            placedEnds={ends.length}
            onMaxStartsChange={this.setMaxStarts}
            onMaxEndsChange={this.setMaxEnds}
            speed={speedTimer}
            onSpeedChange={this.setSpeed}
            onRun={this.run}
            onReset={this.hardReset}
            onClearWalls={this.clearWalls}
            inProgress={inProgress}
            panelWidth={panelWidth}
            panelMinWidth={PANEL_MIN}
            onPanelWidthChange={this.setPanelWidth}
          />
          <div className="graph-grid" ref={this.gridRef}>
            <Grid
              rows={this.state.row}
              cols={this.state.col}
              cellW={cellW}
              cellH={cellH}
              cells={cells}
              starts={starts}
              ends={ends}
              wallTypes={wallTypes}
              exploredOwner={exploredOwner}
              frontierOwner={frontierOwner}
              pathSet={pathSet}
              onPointerDown={this.onCellPointerDown}
              onPointerEnter={this.onCellPointerEnter}
              onPointerUp={this.onCellPointerUp}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Graph;
