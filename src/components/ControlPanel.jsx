import React, { Component } from "react";
import { ALGORITHMS } from "../algorithms";
import { INF, START_TINTS, newWallTypeId } from "../cellModel";

const TOOL_LABELS = {
  start: "Place Start",
  end: "Place End",
  erase: "Eraser",
};

// Speed-slider mapping: slider value 0 = slow, 100 = fast.
// Internally we still store milliseconds-per-frame.
const SPEED_MIN_MS = 5;    // fastest
const SPEED_MAX_MS = 200;  // slowest
const speedToSliderPct = (ms) =>
  Math.round(((SPEED_MAX_MS - ms) / (SPEED_MAX_MS - SPEED_MIN_MS)) * 100);
const sliderPctToSpeed = (pct) =>
  Math.round(SPEED_MAX_MS - (pct / 100) * (SPEED_MAX_MS - SPEED_MIN_MS));

class ControlPanel extends Component {
  state = {
    showAddWall: false,
    draftName: "",
    draftColor: "#d94f70",
    draftWeight: 3,
  };

  setTool = (tool) => this.props.onToolChange(tool);

  // ---- Panel resize (drag the right edge) ----
  onResizerMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = this.props.panelWidth;
    const minW = this.props.panelMinWidth || 200;
    const onMove = (ev) => {
      const maxW = Math.floor(window.innerWidth / 2);
      const w = Math.max(minW, Math.min(maxW, startW + (ev.clientX - startX)));
      this.props.onPanelWidthChange(w);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.classList.remove("cp-resizing");
    };
    document.body.classList.add("cp-resizing");
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  startAddWall = () =>
    this.setState({ showAddWall: true, draftName: "", draftColor: "#d94f70", draftWeight: 3 });

  cancelAddWall = () => this.setState({ showAddWall: false });

  commitAddWall = () => {
    const name = this.state.draftName.trim() || `Terrain ${this.props.wallTypes.length}`;
    const w = Number(this.state.draftWeight);
    const weight = Number.isFinite(w) && w > 0 ? w : 2;
    const wt = {
      id: newWallTypeId(),
      name,
      color: this.state.draftColor,
      weight,
      builtin: false,
    };
    this.props.onAddWallType(wt);
    this.setState({ showAddWall: false });
  };

  render() {
    const {
      algorithm,
      onAlgorithmChange,
      tool,
      wallTypes,
      onRemoveWallType,
      maxStarts,
      maxEnds,
      onMaxStartsChange,
      onMaxEndsChange,
      placedStarts,
      placedEnds,
      speed,
      onSpeedChange,
      onRun,
      onReset,
      onClearWalls,
      inProgress,
    } = this.props;

    const algoMeta = ALGORITHMS[algorithm] || ALGORITHMS.bfs;
    const showWeights = algoMeta.weighted;
    // For unweighted algorithms, only show the built-in Hard Wall — extra
    // weighted terrain types have no semantic effect and just clutter the UI.
    const visibleWallTypes = showWeights
      ? wallTypes
      : wallTypes.filter((w) => w.builtin);
    const panelWidth = this.props.panelWidth;

    return (
      <aside className="control-panel" style={{ width: panelWidth }}>
        <section className="cp-section">
          <h3 className="cp-title">Algorithm</h3>
          <select
            className="cp-select"
            value={algorithm}
            onChange={(e) => onAlgorithmChange(e.target.value)}
            disabled={inProgress}
          >
            {Object.entries(ALGORITHMS).map(([key, meta]) => (
              <option key={key} value={key}>
                {meta.label}
              </option>
            ))}
          </select>
          <div className="cp-algo-hint">
            {showWeights
              ? "Weighted: terrain weights apply."
              : "Unweighted: only the Hard Wall blocks; extra terrains aren't shown."}
          </div>
        </section>

        <section className="cp-section">
          <h3 className="cp-title">Tools</h3>
          <div className="cp-tool-grid">
            {["start", "end", "erase"].map((t) => (
              <button
                key={t}
                className={"cp-tool" + (tool === t ? " active" : "")}
                onClick={() => this.setTool(t)}
                disabled={inProgress}
              >
                <span className={"cp-tool-swatch tool-" + t} />
                {TOOL_LABELS[t]}
              </button>
            ))}
          </div>
        </section>

        <section className="cp-section">
          <h3 className="cp-title">{showWeights ? "Wall / Terrain Palette" : "Wall"}</h3>
          <div className="cp-walls">
            {visibleWallTypes.map((wt) => {
              const active = tool === wt.id;
              return (
                <div
                  key={wt.id}
                  className={"cp-wall" + (active ? " active" : "")}
                >
                  <button
                    className="cp-wall-pick"
                    onClick={() => this.setTool(wt.id)}
                    disabled={inProgress}
                    title={`Click cells to paint ${wt.name}`}
                  >
                    <span
                      className="cp-wall-swatch"
                      style={{ background: wt.color }}
                    />
                    <span className="cp-wall-name">{wt.name}</span>
                    <span className="cp-wall-weight">
                      {showWeights ? (wt.weight === INF ? "∞" : `w=${wt.weight}`) : "wall"}
                    </span>
                  </button>
                  {!wt.builtin && (
                    <button
                      className="cp-wall-x"
                      onClick={() => onRemoveWallType(wt.id)}
                      disabled={inProgress}
                      title="Remove this wall type"
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {showWeights && this.state.showAddWall ? (
            <div className="cp-wall-form">
              <input
                className="cp-input"
                placeholder="Name (e.g. Sand)"
                value={this.state.draftName}
                onChange={(e) => this.setState({ draftName: e.target.value })}
              />
              <div className="cp-wall-form-row">
                <label className="cp-input-label">Color</label>
                <input
                  type="color"
                  value={this.state.draftColor}
                  onChange={(e) => this.setState({ draftColor: e.target.value })}
                />
                <label className="cp-input-label">Weight</label>
                <input
                  className="cp-input cp-input-weight"
                  type="number"
                  min={1}
                  step={1}
                  value={this.state.draftWeight}
                  onChange={(e) => this.setState({ draftWeight: e.target.value })}
                />
              </div>
              <div className="cp-wall-form-actions">
                <button className="cp-btn cp-btn-accent" onClick={this.commitAddWall}>
                  Add
                </button>
                <button className="cp-btn" onClick={this.cancelAddWall}>
                  Cancel
                </button>
              </div>
            </div>
          ) : showWeights ? (
            <button
              className="cp-btn cp-btn-add"
              onClick={this.startAddWall}
              disabled={inProgress}
            >
              + New wall type
            </button>
          ) : null}
        </section>

        <section className="cp-section">
          <h3 className="cp-title">Sources & Targets</h3>
          <div className="cp-counter">
            <label>Start points</label>
            <input
              type="number"
              min={1}
              max={6}
              value={maxStarts}
              onChange={(e) =>
                onMaxStartsChange(Math.max(1, Math.min(6, Number(e.target.value) || 1)))
              }
              disabled={inProgress}
            />
            <span className="cp-counter-status">
              {placedStarts}/{maxStarts} placed
            </span>
          </div>
          <div className="cp-counter">
            <label>End points</label>
            <input
              type="number"
              min={1}
              max={6}
              value={maxEnds}
              onChange={(e) =>
                onMaxEndsChange(Math.max(1, Math.min(6, Number(e.target.value) || 1)))
              }
              disabled={inProgress}
            />
            <span className="cp-counter-status">
              {placedEnds}/{maxEnds} placed
            </span>
          </div>
          <div className="cp-tints">
            {Array(maxStarts).fill(0).map((_, i) => (
              <span
                key={i}
                className="cp-tint-dot"
                style={{ background: START_TINTS[i % START_TINTS.length] }}
                title={`Start #${i + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="cp-section">
          <h3 className="cp-title">Animation</h3>
          <div className="cp-speed">
            <label>Speed</label>
            <input
              type="range"
              min={0}
              max={100}
              value={speedToSliderPct(speed)}
              onChange={(e) => onSpeedChange(sliderPctToSpeed(Number(e.target.value)))}
            />
            <div className="cp-speed-labels">
              <span>Slow</span>
              <span>Fast</span>
            </div>
          </div>
        </section>

        <section className="cp-section cp-actions">
          <button
            className="cp-btn cp-btn-primary"
            onClick={onRun}
            disabled={inProgress}
          >
            ▶ Run {algoMeta.label}
          </button>
          <button className="cp-btn cp-btn-warn" onClick={onReset}>
            Reset
          </button>
          <button
            className="cp-btn cp-btn-ghost"
            onClick={onClearWalls}
            disabled={inProgress}
          >
            Clear walls
          </button>
        </section>
        <div
          className="cp-resizer"
          onMouseDown={this.onResizerMouseDown}
          title="Drag to resize panel"
        />
      </aside>
    );
  }
}

export default ControlPanel;
