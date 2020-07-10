import React from "react";
import "../style/Graph.css";

const Box = (props) => {
  return (
    <button
      className={props.className}
      onClick={props.onClick}
      onPointerEnter={props.onPointerEnter}
      onPointerDown={props.onPointerDown}
      onPointerUp={props.onPointerUp}
    >
      {props.value}
    </button>
  );
};
export default Box;
