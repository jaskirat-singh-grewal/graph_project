import React from "react";
import "../style/Graph.css";

const Box = (props) => {
  let style,
    span = null,
    s = new String(props.className);
  if (props.offsetBool) {
    style = {
      width: props.boxSize + props.allBoxOffset + 1,
    };
  } else {
    style = { width: props.boxSize + props.allBoxOffset };
  }
  if (s.valueOf() === new String("startBox").valueOf()) {
    span = (
      <span
        class="glyphicon glyphicon-move"
        style={{
          "font-size": props.allBoxOffset + 2 + "px",
        }}
      ></span>
    );
  } else if (s.valueOf() === new String("endBox").valueOf()) {
    span = (
      <span
        class="glyphicon glyphicon-record"
        style={{
          "font-size": props.allBoxOffset + 2 + "px",
        }}
      ></span>
    );
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
      {span}
    </button>
  );
};
export default Box;
