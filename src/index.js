import React from "react";
import ReactDOM from "react-dom";
import "./style/index.css";
import Graph from "./components/Graph.jsx";
import Nav from "./components/Nav.jsx";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.css";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      algorithm: "bfs",
    };
  }

  handleAlgorithmChange = (algo) => {
    this.setState({ algorithm: algo });
  };

  render() {
    return (
      <React.StrictMode>
        <Nav
          algorithm={this.state.algorithm}
          onAlgorithmChange={this.handleAlgorithmChange}
        />
        <Graph algorithm={this.state.algorithm} />
      </React.StrictMode>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
serviceWorker.unregister();
