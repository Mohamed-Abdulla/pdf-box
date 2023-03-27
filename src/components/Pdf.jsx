import React, { useState } from "react";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
import a from "./a.pdf";

const Pdf = ({ children, updateBoxPostion }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const [target, setTarget] = useState(null);
  const [distX, setDistX] = useState(0);
  const [distY, setDistY] = useState(0);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }
  function onStart(e) {
    const target = e.target;
    setTarget(target);
    const evt = e.type === "touchstart" ? e.changedTouches[0] : e;
    setDistX(Math.abs(target.offsetLeft - evt.clientX));
    setDistY(Math.abs(target.offsetTop - evt.clientY));
    target.style.pointerEvents = "none";
  }

  function onEnd() {
    if (target) {
      target.style.pointerEvents = "initial";
      setTarget(null);
      setDistX(0);
      setDistY(0);
      const boxId = target.id;
      const box = document.getElementById(boxId);
      const boxX = box.offsetLeft + box.offsetWidth / 2;
      const boxY = box.offsetTop + box.offsetHeight / 2;
      const label = target.id;
      updateBoxPostion((prevState) => ({
        ...prevState,
        [label]: { x: boxX, y: boxY },
      }));
    }
  }

  function onMove(e) {
    if (target) {
      if (target.style.pointerEvents === "none") {
        const evt = e.type === "touchmove" ? e.changedTouches[0] : e;
        target.style.left = `${evt.clientX - distX}px`;
        target.style.top = `${evt.clientY - distY}px`;

        // Get box coordinates
        const boxId = target.id;
        const box = document.getElementById(boxId);
        const boxX = box.offsetLeft + box.offsetWidth / 2;
        const boxY = box.offsetTop + box.offsetHeight / 2;
      }
    }
  }

  return (
    <div
      className="dragger-area"
      onMouseMove={onMove}
      onTouchMove={onMove}
      onMouseUp={onEnd}
      onTouchEnd={onEnd}
      role="presentation"
    >
      {children(onStart)}
      <Document file={a} onLoadSuccess={onDocumentLoadSuccess}>
        <Page pageNumber={1} />
      </Document>
    </div>
  );
};

export default Pdf;
