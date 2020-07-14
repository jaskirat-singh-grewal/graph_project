import React, { Component } from "react";
import "../style/Graph.css";
import Grid from "./Grid";

class Graph extends Component {
  constructor(props) {
    super(props);
    const ROW = Math.floor(window.innerHeight / 33),
      COL = 30;
    let wallPointer = false;
    this.wallPointer = wallPointer;
    this.ROW = ROW;
    this.COL = COL;
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
    };
  }
  getEdgeBoxes(id, visited, parent) {
    const ROW = this.ROW,
      COL = this.COL;
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
    /*     if (rowNum !== 0 && colNum !== 0 && !visited[id - COL - 1]) {
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
    } */
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
      });
      console.log("From BoxClick startBoxIndex = ", this.state);
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
        });
        console.log("From boxClick endBoxIndex = ", this.state);
      }
    }
    console.log("From boxClick endline = ", this.state);
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
      });
    }
  }
  async buttonStart() {
    const boxContent = this.state.boxContent,
      box = boxContent.box,
      { startBoxIndex, endBoxIndex, wallBoxes } = boxContent;

    let transBoxes = [],
      resultBoxes = [],
      coveredBoxes = [],
      distance = 0,
      resultFlag = true;
    let totalBoxes = this.ROW * this.COL;
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
      });
    }
    if (resultFlag) {
      coveredBoxes.push(...transBoxes);
      let loopLength = distance,
        currentResultBox = parent[endBoxIndex];
      do {
        resultBoxes.push(currentResultBox);
        await new Promise((resolve) => setTimeout(resolve, 20));
        console.log("currentRBox: ", currentResultBox);
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
        <div className="graph-grid">
          <Grid
            rows={this.ROW}
            cols={this.COL}
            boxContent={boxContent}
            onClick={(i) => this.boxClick(i)}
            onPointerDown={(i) => this.wallPointerDown(i)}
            onPointerEnter={(i) => this.createWall(i)}
            onPointerUp={(i) => this.wallPointerUp(i)}
          />
        </div>
        <div className="graph-info">
          <button
            class="btn btn-primary btn-md"
            onClick={() => this.buttonStart()}
          >
            Start
          </button>
        </div>
      </div>
    );
  }
}
export default Graph;
