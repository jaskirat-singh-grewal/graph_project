import React from "react";
import "../style/Graph.css";

const Box = (props) => {
  let style,
    icon = null;
  if (props.offsetBool) {
    style = {
      width: props.boxSize + props.allBoxOffset + 1,
    };
  } else {
    style = { width: props.boxSize + props.allBoxOffset };
  }
  if (props.className.valueOf() === "startBox".valueOf()) {
    //if (s.valueOf() === new String("startBox").valueOf()) {
    icon = (
      <div>
        <i
          class="fa fa-arrows"
          style={{
            "font-size": props.allBoxOffset - 2 + "px",
          }}
        ></i>
      </div>
    );
  } else if (props.className.valueOf() === "endBox".valueOf()) {
    icon = (
      <i
        class="fa fa-bullseye"
        style={{
          "font-size": props.allBoxOffset - 1 + "px",
          "vertical-align": "middle !important",
        }}
      ></i>
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
      {icon}
    </button>
  );
};
export default Box;
