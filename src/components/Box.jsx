import React from "react";
import "../style/Graph.css";

const Box = (props) => {
  return (
    <button className={props.className} onClick={props.onClick}>
      {props.value}
    </button>
  );
};
export default Box;
