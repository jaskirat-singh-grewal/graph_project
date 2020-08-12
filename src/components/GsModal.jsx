import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import "../style/GsModal.css";
import img1 from "../gifs/graphImg.jpg";
import gif1 from "../gifs/1.gif";
import gif2 from "../gifs/2.gif";
import gif3 from "../gifs/3.gif";
import gif4 from "../gifs/4.gif";
import gif5 from "../gifs/5.gif";

class GsModal extends Component {
  state = {
    isOpen: true,
    page: 1,
    totalPage: 6,
    prevDisabled: true,
    nextButtonContent: "Next",
  };
  onNext() {
    let { page } = this.state;
    if (this.state.totalPage === page) {
      this.setState({ isOpen: false });
    } else if (page === this.state.totalPage - 1) {
      this.setState({ page: page + 1, nextButtonContent: "Finish" });
    } else {
      this.setState({ page: page + 1, prevDisabled: false });
    }
  }
  onPrev() {
    let { page } = this.state;
    if (this.state.page === 2) {
      this.setState({
        prevDisabled: true,
        page: page - 1,
      });
    } else {
      this.setState({ page: page - 1, nextButtonContent: "Next" });
    }
  }
  closeModal() {
    this.setState({ isOpen: false });
  }
  render() {
    let gif, content, heading;
    switch (this.state.page) {
      case 1:
        gif = img1;
        heading = "Welcome to Shortest Pathfinder!";
        content =
          "This is a project based of finding the shortest path in a graph using dijkstra's algoithm, which guarantees the searched path to be the shortest unlike other algorithms such as swarm algorithm, greedy best first search, depth-first search, etc";

        break;
      case 2:
        gif = gif1;
        heading = "How to get started?";
        content =
          "Select the starting node from which you want to search the path.";

        break;
      case 3:
        gif = gif2;
        heading = "How to get started?";
        content = "Then select your target node.";

        break;
      case 4:
        gif = gif3;
        heading = "How to get started?";
        content =
          "You can create a wall by dragging or clicking on different nodes. The shortest path cannot go through these walls.";

        break;
      case 5:
        gif = gif4;
        heading = "How to get started?";
        content =
          "When you are done with building a wall, click on the start button to search for the required path.";

        break;
      case 6:
        gif = gif5;
        heading = "How to get started?";
        content =
          "You can clear everything anytime, just by clicking on the reset button at the top. Have fun!";

        break;
      default:
        gif = null;
        heading = "";
        content = "";
    }
    return (
      <Modal
        show={this.state.isOpen}
        onHide={this.state.isOpen}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
      >
        <Modal.Body>
          <button
            onClick={() => {
              this.closeModal();
            }}
            class="close"
          >
            x
          </button>
          <h1>{heading}</h1>
          <p class="jumbotron" style={{ padding: "20px 0px 20px 0px" }}>
            <img src={gif} onError="onError=null" alt="page gif" />
          </p>
          <p>{content}</p>
        </Modal.Body>
        <div class="footer">
          <div class="pageNo">
            {this.state.page}/{this.state.totalPage}
          </div>
          <button
            class="btn btn-primary btn-sm"
            onClick={() => {
              this.onNext();
            }}
          >
            {this.state.nextButtonContent}
          </button>
          <button
            disabled={this.state.prevDisabled}
            class="btn btn-primary btn-sm"
            onClick={() => {
              this.onPrev();
            }}
          >
            Prev
          </button>
        </div>
      </Modal>
    );
  }
}

export default GsModal;
