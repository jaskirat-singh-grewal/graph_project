/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";
import { ALGORITHMS } from "../algorithms";

class Nav extends Component {
  render() {
    const { algorithm, onAlgorithmChange } = this.props;
    const currentLabel = (ALGORITHMS[algorithm] || ALGORITHMS.bfs).label;

    return (
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-dark site-nav"
        style={{ margin: 0, borderRadius: 0 }}
      >
        <a className="navbar-brand site-brand" href="#">
          <span className="brand-mark">◆</span> Path Visualizer
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <a className="nav-link" href="#">
                Home <span className="sr-only">(current)</span>
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdownMenuLink"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {currentLabel}
              </a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
                {Object.entries(ALGORITHMS).map(([key, meta]) => (
                  <a
                    key={key}
                    className="dropdown-item"
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
                    {meta.label}
                  </a>
                ))}
              </div>
            </li>
          </ul>
          <span className="nav-tagline">
            BFS · DFS · Dijkstra · A* — multi-source, weighted terrain
          </span>
        </div>
      </nav>
    );
  }
}

export default Nav;
