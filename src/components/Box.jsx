import React from "react";
import "../style/Graph.css";

// Width and height are passed in pixels so the grid tiles its container
// exactly (no leftover gap at the right or bottom). Glyph line-height
// follows cellH so the centered number/star stays aligned.
const Box = (props) => {
  const { cellW, cellH, role, bgOverride, glyph } = props;
  const style = {
    width: cellW,
    height: cellH,
    lineHeight: cellH + "px",
  };
  if (bgOverride) style.background = bgOverride;

  const className = "cell cell-" + role;

  return (
    <button
      style={style}
      className={className}
      onClick={props.onClick}
      onPointerEnter={props.onPointerEnter}
      onPointerDown={props.onPointerDown}
      onPointerUp={props.onPointerUp}
    >
      {glyph && <span className="cell-glyph">{glyph}</span>}
    </button>
  );
};
export default Box;
