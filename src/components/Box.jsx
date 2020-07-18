import React from "react";
import "../style/Graph.css";

const Box = (props) => {
  let style;
  if (props.offsetBool) {
    style = {
      width: props.boxSize + props.allBoxOffset + 1,
    };
  } else {
    style = { width: props.boxSize + props.allBoxOffset };
  }
  return (
    <button
      style={style}
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
