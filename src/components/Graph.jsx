import React, { Component } from "react";
import "../style/Graph.css";
import Grid from "./Grid";

class Graph extends Component {
  constructor(props) {
    super(props);
    const ROW = 15,
      COL = 15;
    this.ROW = ROW;
    this.COL = COL;
    let box = Array(ROW * COL).fill(null);
    this.state = {
      boxContent: {
        box: box,
        startBoxIndex: null,
        endBoxIndex: null,
        transitionBoxes: [],
        coveredBoxes: [],
        resultBoxes: [],
      },
    };
  }
  getEdgeBoxes(id, visited) {
    const ROW = this.ROW,
      COL = this.COL;
    const rowNum = Math.floor(id / COL);
    const colNum = id % COL;
    let arr = [];
    if (rowNum != 0 && !visited[id - COL]) {
      arr.push(id - COL);
    }
    if (rowNum != ROW - 1 && !visited[id + COL]) {
      arr.push(id + COL);
    }
    if (colNum != 0 && !visited[id - 1]) {
      arr.push(id - 1);
    }
    if (colNum != COL - 1 && !visited[id + 1]) {
      arr.push(id + 1);
    }
    return arr;
  }
  boxClick(i) {
    const boxContent = this.state.boxContent;
    const box = boxContent.box;
    const { startBoxIndex, endBoxIndex } = boxContent;
    if (!startBoxIndex) {
      this.setState({
        boxContent: {
          box: box,
          startBoxIndex: i,
          endBoxIndex: null,
          transitionBoxes: [],
          coveredBoxes: [],
          resultBoxes: [],
        },
      });
      console.log("From BoxClick startBoxIndex = ", this.state);
    } else if (startBoxIndex && !endBoxIndex) {
      if (startBoxIndex === i) {
        return;
      } else {
        this.setState({
          boxContent: {
            box: box,
            startBoxIndex: this.state.boxContent.startBoxIndex,
            endBoxIndex: i,
            transitionBoxes: [],
            coveredBoxes: [],
            resultBoxes: [],
          },
        });
        console.log("From boxClick endBoxIndex = ", this.state);
      }
    } else {
      let qArr = [];
      let totalBoxes = this.ROW * this.COL;
      let visited = Array(totalBoxes).fill(false);
      let prev = Array(totalBoxes).fill(null);
      visited[boxContent.startBoxIndex] = true;
      qArr.push(boxContent.startBoxIndex);
      let currentBox;
      while (!(qArr.length < 1)) {
        currentBox = qArr.shift();
        neighbours = getEdgeBoxes(currentBox, visited);
      }
    }
    console.log("From boxClick endline = ", this.state);
    return;
  }
  buttonStart() {
    const boxContent = [
      {
        box: Array(9).fill(null),
        startBoxIndex: null,
        endBoxIndex: null,
      },
    ];
    this.setState({
      boxContent: boxContent,
    });
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
          />
        </div>
        <div className="graph-info">
          <button
            className="btn btn-primary btn-md"
            onClick={() => this.buttonStart()}
          >
            Start
          </button>
        </div>
      </div>
    );
  }
}

// ========================================

function calculateWinner(box) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (box[a] && box[a] === box[b] && box[a] === box[c]) {
      return box[a];
    }
  }
  return null;
}
export default Graph;
