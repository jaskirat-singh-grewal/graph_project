import React from "react";
import "../style/Graph.css";

const Box = (props) => {
  const width = props.offsetBool
    ? props.boxSize + props.allBoxOffset + 1
    : props.boxSize + props.allBoxOffset;

  const style = { width };
  if (props.bgOverride) style.background = props.bgOverride;

  const className = "cell cell-" + props.role;

  return (
    <button
      style={style}
      className={className}
      onClick={props.onClick}
      onPointerEnter={props.onPointerEnter}
      onPointerDown={props.onPointerDown}
      onPointerUp={props.onPointerUp}
    >
      {props.glyph && <span className="cell-glyph">{props.glyph}</span>}
    </button>
  );
};
export default Box;
