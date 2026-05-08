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

// Target visual cell footprint for the responsive layout. Cells are square-ish.
const TARGET_CELL = 28;

// Default + bounds for the resizable left panel.
const PANEL_DEFAULT = 280;
const PANEL_MIN = 200;

const initialState = (rows, cols) => ({
  cells: makeEmptyCells(rows, cols),
  starts: [],
  ends: [],
  // Per-cell render state during/after a run.
  // null when no run yet. Otherwise:
  //   exploredOwner[i]   -> ownerStart index (closed cells)
  //   frontierOwner[i]   -> ownerStart index (active wave cells)
  //   pathSet            -> Set<idx> of winning path cells
  exploredOwner: new Array(rows * cols).fill(-1),
  frontierOwner: new Array(rows * cols).fill(-1),
  pathSet: new Set(),
});

class Graph extends Component {
  constructor(props) {
    super(props);
    this.BOXSIZE = 5;
    this.dragTool = null;       // active tool while pointer is held
    this.cancelRequested = false;
    this.gridRef = React.createRef();
    this.state = {
      ...initialState(INITIAL_ROW, INITIAL_COL),
      row: INITIAL_ROW,
      col: INITIAL_COL,
      sizeOffset: INITIAL_ROW % 5,
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
    // Observe the grid container directly so we react to ANY size change —
    // window resizes, panel-resizer drags, font-size changes, etc.
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
    // Algorithm switched from outside? Reset just the run results, keep map.
    if (prevProps.algorithm !== this.props.algorithm) {
      this.softResetRun();
      // If the new algorithm is unweighted, only the built-in Hard Wall makes
      // sense as a "wall" tool. If the user had a custom/weighted terrain
      // selected, fall back to the Hard Wall.
      const meta = ALGORITHMS[this.props.algorithm];
      if (meta && !meta.weighted) {
        const t = this.state.tool;
        const wt = this.state.wallTypes.find((w) => w.id === t);
        if (wt && !wt.builtin) {
          this.setState({ tool: HARD_WALL_ID });
        }
      }
    }
  }

  setPanelWidth = (w) => this.setState({ panelWidth: w });

  resize = () => {
    // Size the grid against the actual .graph-grid container (not the viewport),
    // and also choose row/col counts that fill the available area at TARGET_CELL.
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
    const offset = Math.max(0, innerW - (this.BOXSIZE - 1) * cols);

    if (cols !== this.state.col || rows !== this.state.row) {
      // Resize means the state arrays' length is wrong — wipe the board.
      // Cancel any in-flight animation; preserve user prefs.
      this.cancelRequested = true;
      this.setState((s) => ({
        ...initialState(rows, cols),
        row: rows,
        col: cols,
        sizeOffset: offset,
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
    } else if (offset !== this.state.sizeOffset) {
      this.setState({ sizeOffset: offset });
    }
  };

  // ---- Tool / palette plumbing ----------------------------------------------

  setTool = (tool) => this.setState({ tool });

  addWallType = (wt) =>
    this.setState((s) => ({ wallTypes: [...s.wallTypes, wt], tool: wt.id }));

  removeWallType = (id) =>
    this.setState((s) => {
      // Erase any cells using this terrain.
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
      // Don't drop a start onto an existing end or a wall cell.
      if (ends.includes(idx)) return;
      if (cells[idx].weight === INF) return;
      if (starts.includes(idx)) return;
      let nextStarts = starts.slice();
      if (nextStarts.length >= maxStarts) {
        nextStarts.shift(); // FIFO replace
      }
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
      if (starts.includes(idx)) return;
      if (cells[idx].weight === INF) return;
      if (ends.includes(idx)) return;
      let nextEnds = ends.slice();
      if (nextEnds.length >= maxEnds) {
        nextEnds.shift();
      }
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
      // Erases walls/terrain at idx, and removes start/end if there.
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
    // For start/end, dragging would spam placements — only paint walls/erase on drag.
    if (this.dragTool === "start" || this.dragTool === "end") return;
    this.applyTool(idx, false);
  };

  onCellPointerUp = () => {
    this.dragTool = null;
  };

  onCellClick = (idx) => {
    // Click is already handled by pointerdown; keep this as a fallback for
    // assistive devices.
    if (this.dragTool == null) this.applyTool(idx, true);
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
      sizeOffset: s.sizeOffset,
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

  sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

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

    // Run the algorithm synchronously (cheap) — it returns the full trace.
    const result = runAlgorithm(algorithm, { cells, starts, ends, rows, cols });

    // Animate frames.
    const explored = new Array(rows * cols).fill(-1);
    const frontier = new Array(rows * cols).fill(-1);
    for (const frame of result.frames) {
      if (this.cancelRequested) break;
      // Demote any cells that are explored from previous frame
      for (let i = 0; i < frontier.length; i++) {
        if (frontier[i] !== -1 && explored[i] === -1) {
          // they remain frontier until next frame; explicit nothing
        }
      }
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

    // Animate the winning path.
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
              boxSize={this.BOXSIZE}
              sizeOffset={this.state.sizeOffset}
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
              onClick={this.onCellClick}
            />
          </div>
        </div>
      </div>
    );
  }
}
export default Graph;
