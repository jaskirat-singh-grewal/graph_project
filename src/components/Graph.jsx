import React, { Component } from "react";
import "../style/Graph.css";
import Grid from "./Grid";

class Graph extends Component {
  constructor(props) {
    super(props);

    const BOXSIZE = 5; // used for offset only, size greater than this will fit perfectly on the screen
    this.BOXSIZE = BOXSIZE;
    const ROW = 25,
      COL = 50;
    let wallPointer = false;
    this.wallPointer = wallPointer;

    const totalBoxes = ROW * COL;
    let box = Array(ROW * COL).fill(null);
    this.state = {
      box: box,
      boxContent: {
        startBoxIndex: null,
        endBoxIndex: null,
        wallBoxes: [],
        resultBoxes: [],
        transitionBoxes: [],
        coveredBoxes: [],
        distance: 0,
      },
      status: "Please select your starting node.",
      row: ROW,
      col: COL,
      sizeOffset: ROW % BOXSIZE,
      inProgress: false,
      reset: false,
      speedTimer: 40,
    };
  }
  componentDidMount() {
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
  }

  resize() {
    let offset =
      document.documentElement.clientWidth -
      (this.BOXSIZE - 1) * this.state.col;
    this.setState({
      sizeOffset: offset,
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resize.bind(this));
  }
  getEdgeBoxes(id, visited, parent) {
    const ROW = this.state.row,
      COL = this.state.col;
    const rowNum = Math.floor(id / COL);
    const colNum = id % COL;
    let arr = [];
    if (rowNum !== 0 && !visited[id - COL]) {
      arr.push(id - COL);
      visited[id - COL] = true;
      parent[id - COL] = id;
    }
    if (rowNum !== ROW - 1 && !visited[id + COL]) {
      arr.push(id + COL);
      visited[id + COL] = true;
      parent[id + COL] = id;
    }
    if (colNum !== 0 && !visited[id - 1]) {
      arr.push(id - 1);
      visited[id - 1] = true;
      parent[id - 1] = id;
    }
    if (colNum !== COL - 1 && !visited[id + 1]) {
      arr.push(id + 1);
      visited[id + 1] = true;
      parent[id + 1] = id;
    }
    //To consider corner edges.
    /*if (rowNum !== 0 && colNum !== 0 && !visited[id - COL - 1]) {
      arr.push(id - COL - 1);
      visited[id - COL - 1] = true;
      parent[id - COL - 1] = id;
    }
    if (rowNum !== 0 && colNum !== COL - 1 && !visited[id - COL + 1]) {
      arr.push(id - COL + 1);
      visited[id - COL + 1] = true;
      parent[id - COL + 1] = id;
    }
    if (rowNum !== ROW - 1 && colNum !== COL - 1 && !visited[id + COL + 1]) {
      arr.push(id + COL + 1);
      visited[id + COL + 1] = true;
      parent[id + COL + 1] = id;
    }
    if (rowNum !== ROW - 1 && colNum !== 0 && !visited[id + COL - 1]) {
      arr.push(id + COL - 1);
      visited[id + COL - 1] = true;
      parent[id + COL - 1] = id;
    }*/
    return arr;
  }
  boxClick(i) {
    if (this.state.inProgress) {
      return;
    } else {
      this.setState({
        reset: false,
        inProgress: false,
      });
    }
    const boxContent = this.state.boxContent,
      { startBoxIndex, endBoxIndex, distance } = boxContent;
    if (startBoxIndex === null) {
      this.setState({
        boxContent: {
          startBoxIndex: i,
          endBoxIndex: null,
          wallBoxes: this.state.boxContent.wallBoxes,
          resultBoxes: [],
          transitionBoxes: [],
          coveredBoxes: [],
          distance: distance,
        },
        status: "Now please select you ending or target node.",
      });
    } else if (startBoxIndex !== null && endBoxIndex === null) {
      if (startBoxIndex === i) {
        return;
      } else {
        this.setState({
          boxContent: {
            startBoxIndex: startBoxIndex,
            endBoxIndex: i,
            wallBoxes: this.state.boxContent.wallBoxes,
            resultBoxes: [],
            transitionBoxes: [],
            coveredBoxes: [],
            distance: distance,
          },
          status: "Drag or Click node to create a wall (weight = infinity)",
        });
      }
    }
    return;
  }
  wallPointerDown(i) {
    if (this.state.inProgress) {
      return;
    }
    const boxContent = this.state.boxContent,
      {
        startBoxIndex,
        endBoxIndex,
        resultBoxes,
        transitionBoxes,
        coveredBoxes,
        wallBoxes,
        distance,
      } = boxContent;
    if (startBoxIndex !== null && endBoxIndex !== null) {
      this.wallPointer = true;
      let newWallBoxes = wallBoxes;
      newWallBoxes.push(i);
      this.setState({
        boxContent: {
          startBoxIndex: startBoxIndex,
          endBoxIndex: endBoxIndex,
          wallBoxes: newWallBoxes,
          resultBoxes: resultBoxes,
          transitionBoxes: transitionBoxes,
          coveredBoxes: coveredBoxes,
          distance: distance,
        },
      });
    }
  }
  wallPointerUp(i) {
    if (this.state.inProgress) {
      return;
    }
    this.wallPointer = false;
  }
  createWall(i) {
    if (this.state.inProgress) {
      return;
    }
    const boxContent = this.state.boxContent,
      {
        startBoxIndex,
        endBoxIndex,
        resultBoxes,
        transitionBoxes,
        coveredBoxes,
        distance,
      } = boxContent;
    if (startBoxIndex !== null && endBoxIndex !== null && this.wallPointer) {
      let newWallBoxes = this.state.boxContent.wallBoxes;
      newWallBoxes.push(i);
      this.setState({
        boxContent: {
          startBoxIndex: startBoxIndex,
          endBoxIndex: endBoxIndex,
          wallBoxes: newWallBoxes,
          resultBoxes: resultBoxes,
          transitionBoxes: transitionBoxes,
          coveredBoxes: coveredBoxes,
          distance: distance,
        },
      });
    }
  }
  async startButton() {
    if (this.state.inProgress) {
      return;
    } else {
      this.setState({
        reset: false,
      });
    }

    const boxContent = this.state.boxContent,
      { startBoxIndex, endBoxIndex } = boxContent;
    if (startBoxIndex === null) {
      this.setState({
        status: "Please select the starting and target node before searching.",
      });
      return;
    } else if (endBoxIndex === null) {
      this.setState({
        status: "Please select the target node before searching.",
      });
      return;
    } else {
      this.setState({
        status: "Search in Progress, Have Fun!",
        inProgress: true,
      });
    }
    let { wallBoxes } = boxContent;
    while (wallBoxes.includes(endBoxIndex)) {
      wallBoxes.splice(wallBoxes.indexOf(endBoxIndex), 1);
    }

    let transBoxes = [],
      resultBoxes = [],
      coveredBoxes = [],
      distance = 0,
      resultFlag = true;
    let totalBoxes = this.state.row * this.state.col;
    let visited = Array(totalBoxes).fill(false);
    for (let i = 0; i < wallBoxes.length; i++) {
      visited[wallBoxes[i]] = true;
    }
    let parent = Array(totalBoxes).fill(null);
    visited[boxContent.startBoxIndex] = true;
    transBoxes.push(startBoxIndex);
    let newTransBoxes = [];
    while (!transBoxes.includes(endBoxIndex)) {
      distance++;
      newTransBoxes = [];
      for (let i = 0; i < transBoxes.length; i++) {
        newTransBoxes.push(
          ...this.getEdgeBoxes(transBoxes[i], visited, parent)
        );
      }
      if (newTransBoxes.length === 0) {
        resultFlag = false;
        coveredBoxes.push(...transBoxes);
        this.setState({
          status:
            "No path found, shortest distance is infinity. Click reset to retry.",
          inProgress: false,
        });
        return;
      }
      coveredBoxes.push(...transBoxes);
      transBoxes = [...newTransBoxes];
      await new Promise((resolve, reject) => {
        if (!this.state.reset) {
          setTimeout(resolve, this.state.speedTimer);
        } else {
          this.setState({
            boxContent: {
              startBoxIndex: null,
              endBoxIndex: null,
              wallBoxes: [],
              resultBoxes: [],
              transitionBoxes: [],
              coveredBoxes: [],
              distance: 0,
            },
            status: "Please select your starting node.",
            inProgress: false,
            reset: true,
          });
          return;
        }
      });
      this.setState({
        boxContent: {
          startBoxIndex: startBoxIndex,
          endBoxIndex: endBoxIndex,
          wallBoxes: wallBoxes,
          resultBoxes: resultBoxes,
          transitionBoxes: transBoxes,
          coveredBoxes: coveredBoxes,
          distance: distance,
        },
      });
    }
    if (resultFlag) {
      coveredBoxes.push(...transBoxes);
      let loopLength = distance,
        currentResultBox = parent[endBoxIndex];
      do {
        resultBoxes.push(currentResultBox);
        await new Promise((resolve, reject) => {
          if (!this.state.reset) {
            setTimeout(resolve, this.state.speedTimer);
          } else {
            this.setState({
              boxContent: {
                startBoxIndex: null,
                endBoxIndex: null,
                wallBoxes: [],
                resultBoxes: [],
                transitionBoxes: [],
                coveredBoxes: [],
                distance: 0,
              },
              status: "Select your starting node.",
              inProgress: false,
              reset: true,
            });
            return;
          }
        });
        this.setState({
          boxContent: {
            startBoxIndex: startBoxIndex,
            endBoxIndex: endBoxIndex,
            wallBoxes: wallBoxes,
            resultBoxes: resultBoxes,
            coveredBoxes: coveredBoxes,
            transitionBoxes: [],
            distance: distance,
          },
        });
        currentResultBox = parent[currentResultBox];
        loopLength--;
        if (loopLength === 0) {
          this.setState({
            inProgress: false,
            status: "Here is the required shortest path, click reset to retry.",
          });
        }
      } while (loopLength !== 0);
    }
  }
  resetButton() {
    if (this.state.inProgress) {
      this.setState({
        inProgress: false,
        reset: true,
      });
    } else {
      this.setState({
        boxContent: {
          startBoxIndex: null,
          endBoxIndex: null,
          wallBoxes: [],
          resultBoxes: [],
          transitionBoxes: [],
          coveredBoxes: [],
          distance: 0,
        },
        status: "Please select your starting node.",
        inProgress: false,
        reset: false,
      });
    }
  }

  render() {
    const boxContent = this.state.boxContent;

    return (
      <div className="graph">
        <div className="graph-info">
          <div className="nodeInfo">
            <ul>
              <li className="first">
                <button
                  class="startBox"
                  style={{ border: "transparent", animation: "none" }}
                >
                  <span class="glyphicon glyphicon-move"></span>
                </button>
                Starting Node
              </li>
              <li>
                <button
                  className="endBox"
                  style={{ border: "transparent", animation: "none" }}
                >
                  <span class="glyphicon glyphicon-record"></span>
                </button>
                Ending/Target Node
              </li>
              <li>
                <box
                  className="box"
                  style={{ border: "transparent", animation: "none" }}
                />
                Empty Node
              </li>
              <li>
                <box
                  className="coveredBox"
                  style={{ border: "transparent", animation: "none" }}
                />
                Covered Node
              </li>
              <li>
                <box
                  className="resultBox"
                  style={{ border: "transparent", animation: "none" }}
                />
                Result Path Node
              </li>
            </ul>
            <button
              class="btn btn-primary btn-md"
              onClick={() => this.startButton()}
              disabled={this.state.inProgress}
            >
              Search Path
            </button>
            <button
              class="btn btn-warning btn-md"
              onClick={() => this.resetButton()}
              style={{ marginLeft: "20px" }}
            >
              Reset
            </button>
          </div>
          <div className="status">{this.state.status}</div>
        </div>
        <div className="graph-grid">
          <Grid
            box={this.state.box}
            rows={this.state.row}
            cols={this.state.col}
            boxSize={this.BOXSIZE}
            sizeOffset={this.state.sizeOffset}
            boxContent={boxContent}
            onClick={(i) => this.boxClick(i)}
            onPointerDown={(i) => this.wallPointerDown(i)}
            onPointerEnter={(i) => this.createWall(i)}
            onPointerUp={(i) => this.wallPointerUp(i)}
          />
        </div>
      </div>
    );
  }
}
export default Graph;
