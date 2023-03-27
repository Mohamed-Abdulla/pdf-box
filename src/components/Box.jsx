import React from "react";

function Box({ onStart, children }) {
  return (
    <div className="dragger-element" onMouseDown={onStart} onTouchStart={onStart}>
      {children}
    </div>
  );
}

export default Box;
