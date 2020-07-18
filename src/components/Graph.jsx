import React, { Component } from "react";
import "../style/Graph.css";
import Grid from "./Grid";

class Graph extends Component {
  constructor(props) {
    super(props);
    const BOXSIZE = 30;
    this.BOXSIZE = BOXSIZE;
    let ROW = Math.floor(window.innerHeight / (BOXSIZE - 1)),
      COL = Math.floor(window.innerWidth / (BOXSIZE - 1));
    let wallPointer = false;
    this.wallPointer = wallPointer;

    const totalBoxes = ROW * COL;
    let box = Array(ROW * COL).fill(null);
    this.state = {
      boxContent: {
        box: box,
        startBoxIndex: null,
        endBoxIndex: null,
        wallBoxes: [],
        resultBoxes: [],
        transitionBoxes: [],
        coveredBoxes: [],
        distance: 0,
      },
      row: ROW,
      col: COL,
      sizeOffset: ROW % BOXSIZE,
    };
  }
  componentDidMount() {
    window.addEventListener("resize", this.resize.bind(this));
    this.resize();
  }

  resize() {
    let offset = window.innerWidth % (this.BOXSIZE - 1);
    this.setState({
      boxContent: this.state.boxContent,
      row: Math.floor(window.innerHeight / (this.BOXSIZE - 1)),
      col: Math.floor(window.innerWidth / (this.BOXSIZE - 1)),
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
    const boxContent = this.state.boxContent,
      box = boxContent.box,
      { startBoxIndex, endBoxIndex, distance } = boxContent;
    if (startBoxIndex === null) {
      this.setState({
        boxContent: {
          box: box,
          startBoxIndex: i,
          endBoxIndex: null,
          wallBoxes: this.state.boxContent.wallBoxes,
          resultBoxes: [],
          transitionBoxes: [],
          coveredBoxes: [],
          distance: distance,
        },
        row: this.state.row,
        col: this.state.col,
        sizeOffset: this.state.sizeOffset,
      });
    } else if (startBoxIndex !== null && endBoxIndex === null) {
      if (startBoxIndex === i) {
        return;
      } else {
        this.setState({
          boxContent: {
            box: box,
            startBoxIndex: startBoxIndex,
            endBoxIndex: i,
            wallBoxes: this.state.boxContent.wallBoxes,
            resultBoxes: [],
            transitionBoxes: [],
            coveredBoxes: [],
            distance: distance,
          },
          row: this.state.row,
          col: this.state.col,
          sizeOffset: this.state.sizeOffset,
        });
      }
    }
    return;
  }
  wallPointerDown(i) {
    const boxContent = this.state.boxContent,
      box = boxContent.box,
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
          box: box,
          startBoxIndex: startBoxIndex,
          endBoxIndex: endBoxIndex,
          wallBoxes: newWallBoxes,
          resultBoxes: resultBoxes,
          transitionBoxes: transitionBoxes,
          coveredBoxes: coveredBoxes,
          distance: distance,
        },
        row: this.state.row,
        col: this.state.col,
        sizeOffset: this.state.sizeOffset,
      });
    }
  }
  wallPointerUp(i) {
    this.wallPointer = false;
  }
  createWall(i) {
    const boxContent = this.state.boxContent,
      box = boxContent.box,
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
          box: box,
          startBoxIndex: startBoxIndex,
          endBoxIndex: endBoxIndex,
          wallBoxes: newWallBoxes,
          resultBoxes: resultBoxes,
          transitionBoxes: transitionBoxes,
          coveredBoxes: coveredBoxes,
          distance: distance,
        },
        row: this.state.row,
        col: this.state.col,
        sizeOffset: this.state.sizeOffset,
      });
    }
  }
  async buttonStart() {
    const boxContent = this.state.boxContent,
      box = boxContent.box,
      { startBoxIndex, endBoxIndex } = boxContent;
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
        return;
      }
      coveredBoxes.push(...transBoxes);
      transBoxes = [...newTransBoxes];
      await new Promise((resolve) => setTimeout(resolve, 20));
      this.setState({
        boxContent: {
          box: box,
          startBoxIndex: startBoxIndex,
          endBoxIndex: endBoxIndex,
          wallBoxes: wallBoxes,
          resultBoxes: resultBoxes,
          transitionBoxes: transBoxes,
          coveredBoxes: coveredBoxes,
          distance: distance,
        },
        row: this.state.row,
        col: this.state.col,
        sizeOffset: this.state.sizeOffset,
      });
    }
    if (resultFlag) {
      coveredBoxes.push(...transBoxes);
      let loopLength = distance,
        currentResultBox = parent[endBoxIndex];
      do {
        resultBoxes.push(currentResultBox);
        await new Promise((resolve) => setTimeout(resolve, 20));
        this.setState({
          boxContent: {
            box: box,
            startBoxIndex: startBoxIndex,
            endBoxIndex: endBoxIndex,
            wallBoxes: wallBoxes,
            resultBoxes: resultBoxes,
            coveredBoxes: coveredBoxes,
            transitionBoxes: [],
            distance: distance,
          },
          row: this.state.row,
          col: this.state.col,
          sizeOffset: this.state.sizeOffset,
        });
        currentResultBox = parent[currentResultBox];
        loopLength--;
      } while (loopLength !== 0);
    }
  }

  render() {
    const boxContent = this.state.boxContent;

    return (
      <div className="graph">
        <div
          class="jumbotron jumbotron-fluid"
          style={{
            "background-color": "#0f4c75",
            padding: "30px",
            margin: "0px 0px",
          }}
        >
          <div className="graph-info">
            <h1 class="display-4">asdfasfads </h1>
            <button
              class="btn btn-primary btn-md"
              onClick={() => this.buttonStart()}
            >
              Start
            </button>
          </div>
        </div>
        <div className="graph-grid">
          <Grid
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
