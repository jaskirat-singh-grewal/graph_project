import React, { Component } from "react";

const ALGO_LABELS = {
  bfs: "Breadth-First Search",
  dfs: "Depth-First Search",
  dijkstra: "Dijkstra's Algorithm",
  astar: "A* Search",
};

class Nav extends Component {
  render() {
    const { algorithm, onAlgorithmChange } = this.props;
    const currentLabel = ALGO_LABELS[algorithm] || "Breadth-First Search";

    return (
      <nav
        class="navbar navbar-expand-lg navbar-dark bg-dark "
        style={{ margin: "0px", "border-radius": "0px" }}
      >
        <a class="navbar-brand" href="#">
          Dijkstra's Algorithm Visual
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavDropdown">
          <ul class="navbar-nav">
            <li class="nav-item active">
              <a class="nav-link" href="#">
                Home <span class="sr-only">(current)</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                (UnderConstruction) Features
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">
                (UnderConstruction) Have Your Own Graph?
              </a>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdownMenuLink"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {currentLabel}
              </a>
              <div
                class="dropdown-menu"
                aria-labelledby="navbarDropdownMenuLink"
              >
                {Object.entries(ALGO_LABELS).map(([key, label]) => (
                  <a
                    key={key}
                    class="dropdown-item"
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onAlgorithmChange) onAlgorithmChange(key);
                    }}
                    style={
                      algorithm === key
                        ? { backgroundColor: "#0f4c75", color: "#fff" }
                        : {}
                    }
                  >
                    {label}
                  </a>
                ))}
              </div>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

export default Nav;
