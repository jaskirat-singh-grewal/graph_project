import React from "react";
import ReactDOM from "react-dom";
import "./style/index.css";
import App from "./App";
import Graph from "./components/Graph.jsx";
import * as serviceWorker from "./serviceWorker";
import "bootstrap/dist/css/bootstrap.css";

ReactDOM.render(
  <React.StrictMode>
    <Graph />
  </React.StrictMode>,
  document.getElementById("root")
);
serviceWorker.unregister();
