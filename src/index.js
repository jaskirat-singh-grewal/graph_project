import React from "react";
import ReactDOM from "react-dom";
import Graph from "./components/Graph.jsx";
import Nav from "./components/Nav.jsx";

import GsModal from "./components/GsModal.jsx";
import "bootstrap/dist/css/bootstrap.css";

ReactDOM.render(
  <React.StrictMode>
    <GsModal />
    <Nav />
    <Graph />
  </React.StrictMode>,
  document.getElementById("root")
);
