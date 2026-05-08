/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { Component } from "react";
import { ALGORITHMS } from "../algorithms";

class Nav extends Component {
  render() {
    const { algorithm } = this.props;
    const currentLabel = (ALGORITHMS[algorithm] || ALGORITHMS.bfs).label;

    return (
      <nav
        className="navbar navbar-expand-lg navbar-dark bg-dark site-nav"
        style={{ margin: 0, borderRadius: 0 }}
      >
        <a className="navbar-brand site-brand" href="#">
          <span className="brand-mark">◆</span> Path Visualizer
        </a>
        <div className="collapse navbar-collapse show" id="navbarNavDropdown">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <a className="nav-link" href="#">
                Home <span className="sr-only">(current)</span>
              </a>
            </li>
          </ul>
          <span className="nav-selected-algo">
            <span className="nav-selected-label">Selected Algorithm:</span>{" "}
            <span className="nav-selected-value">{currentLabel}</span>
          </span>
        </div>
      </nav>
    );
  }
}

export default Nav;
