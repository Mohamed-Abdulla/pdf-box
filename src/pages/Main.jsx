import React, { useState, useContext } from "react";
import Draggable from "react-draggable";
import { Document, Page, pdfjs } from "react-pdf/dist/esm/entry.webpack5";
import { column1 } from "../constants";
import { FileContext } from "../context/FileContext";
import { Edit, LockOpen, Lock, Done, Clear, Delete } from "@mui/icons-material";
import { Alert, Snackbar } from "@mui/material";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
const Main = () => {
  const [boxPosition, setBoxPosition] = useState({});
  const [numPages, setNumPages] = useState(null);
  const [deltaPosition, setDeltaPosition] = useState(null);
  const [initialBoxPosition, setInitialBoxPosition] = useState({});
  const [canvas, setCanvas] = useState(null);
  const { pdf } = useContext(FileContext);
  const [locked, setLocked] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [isMovable, setIsMovable] = useState(false);
  const [width, setWidth] = useState(112);
  const [height, setHeight] = useState(32);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handleDrag = (e, ui, item) => {
    if (locked) return;
    const listItem = e.target.parentNode;
    const { left, top } = listItem.getBoundingClientRect();
    setInitialBoxPosition((prev) => ({ ...prev, [item.label]: { x: left, y: top } }));

    const draggerArea = document.querySelector(".dragger-area");
    if (!draggerArea) return;

    const draggerAreaRect = draggerArea.getBoundingClientRect();
    const draggerRect = e.target.getBoundingClientRect();

    const x = ui.deltaX + (draggerRect.left - draggerAreaRect.left);
    const y = ui.deltaY + (draggerRect.top - draggerAreaRect.top);

    let updatedBoxPosition = { ...boxPosition };
    let updatedDeltaPosition = { ...deltaPosition };

    if (item.label in boxPosition) {
      const boxPos = boxPosition[item.label];
      if (boxPos.x !== x || boxPos.y !== y) {
        updatedBoxPosition = {
          ...boxPosition,
          [item.label]: { x, y },
        };
        updatedDeltaPosition = {
          ...deltaPosition,
          [item.label]: { x, y },
          ...updatedBoxPosition,
        };
      }
    } else {
      updatedDeltaPosition = {
        ...deltaPosition,
        [item.label]: { x, y },
        ...boxPosition,
      };
    }

    setDeltaPosition({ ...updatedDeltaPosition, ...updatedBoxPosition });
  };

  function handleSave() {
    localStorage.setItem("savedPositions", JSON.stringify(deltaPosition));
    setOpen(true);
    setIsMovable(true);
    setTimeout(() => {
      setOpen(false);
      setValue("29 Nov 2022");
    }, 2000);
  }

  function handleLock() {
    setLocked(true);
  }
  function handleClear() {
    setValue(null);
    setIsMovable(false);
    setWidth(112);
    setHeight(32);
  }

  function handleUnLock() {
    setLocked(false);
    setValue(null);
    setIsMovable(false);
    setWidth(112);
    setHeight(32);
  }
  function onCanvasCreated(canvas) {
    setCanvas(canvas);
  }

  function Drop(e, ui, item) {
    const canvas = document.querySelector(".canv");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    setWidth(70);
    setHeight(20);
    // Starting point of the curve
    const startX = 50;
    const startY = 50;

    // Ending point of the curve
    const endY = 300;
    const endX = 300;

    // Control point for the curve
    const controlX = 25;
    const controlY = 0;

    context.beginPath();
    context.moveTo(startX, startY);
    context.quadraticCurveTo(controlX, controlY, endX, endY);
    context.stroke();
  }

  return (
    <div className="flex p-14 gap-14">
      <canvas
        className="canv"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 99,
          right: 0,
        }}
      />
      <div className="dragger-area" role="presentation">
        <Document file={pdf} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={1} onRenderSuccess={onCanvasCreated} width={595} />
        </Document>

        {column1.map((item, i) => {
          const bp = deltaPosition && deltaPosition[item?.label];
          return (
            // deltaPosition[item?.label] &&
            isMovable && (
              // <Draggable onDrag={(e, ui) => handleDrag(e, ui, item)} key={i}>
              <li
                key={i}
                className={`cursor-grab rounded-md w-28 p-0.5 px-2  border absolute h-8  list-none `}
                style={{ borderColor: item?.color, top: bp?.y, left: bp?.x, width: width, height: height }}
              ></li>
              // </Draggable>
            )
          );
        })}
      </div>
      <ul className="w-fit flex gap-2 flex-col">
        <h3 className="font-semibold">Invoice Fields</h3>
        {column1.map((item, i) => (
          <div className="flex items-center gap-2">
            <li
              key={i}
              className={`cursor-grab  p-0.5 px-2 rounded-md w-28  border-2 relative h-8`}
              style={{ borderColor: item.color }}
            >
              {item.label}
              {/* {!boxPosition[item.label] && */}
              {!locked ? (
                isMovable ? (
                  <span
                    key={i}
                    className={`cursor-grab rounded-md w-28 p-0.5 px-2  border absolute h-8 inset-0 -top-[2px] -left-[2px]
                  `}
                    style={{ borderColor: item.color }}
                  />
                ) : (
                  <Draggable onDrag={(e, ui) => handleDrag(e, ui, item)} onStop={(e, ui) => Drop(e, ui, item)}>
                    <span
                      key={i}
                      className={`cursor-grab rounded-md w-28 p-0.5 px-2  border absolute h-8 inset-0 -top-[2px] -left-[2px]
                  `}
                      style={{ borderColor: item.color, width: width, height: height }}
                    />
                  </Draggable>
                )
              ) : (
                <span
                  key={i}
                  className={`cursor-grab rounded-md w-28 p-0.5 px-2  border absolute h-8 inset-0 -top-[2px] -left-[2px]
                  `}
                  style={{ borderColor: item.color }}
                />
              )}
              {/* } */}
            </li>
            {!locked && <Edit fontSize="small" htmlColor="#232222" />}
            {deltaPosition !== null &&
              (value === null ? (
                <>
                  <LockOpen fontSize="small" htmlColor="#c3ad08" />
                  <button onClick={handleSave} className="border pb-0.5 rounded-md text-white bg-green-600 px-3">
                    save
                  </button>
                  <Snackbar open={open} autoHideDuration={2000} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
                    <Alert severity="info">Data fetching from backend !</Alert>
                  </Snackbar>
                </>
              ) : locked ? (
                <div className="flex items-center gap-1">
                  <p className="text-sm">{value}</p>
                  <Lock fontSize="small" htmlColor="#c3ad08" />
                  <Delete fontSize="small" htmlColor="#c3ad08" onClick={handleUnLock} sx={{ cursor: "pointer" }} />
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <h1>{value}</h1>
                  <span className="cursor-pointer" onClick={handleClear}>
                    <Clear fontSize="small" htmlColor="red" />
                  </span>
                  <span className="cursor-pointer" onClick={handleLock}>
                    <Done fontSize="small" htmlColor="green" />
                  </span>
                </div>
              ))}
          </div>
        ))}
        {/* <hr /> */}
      </ul>
    </div>
  );
};

export default Main;
