import React, { useState, useRef, useEffect } from "react";

import Dragger from "./Dragger";
import Box from "./Box";
import Pdf from "./Pdf";
import Draggable from "react-draggable";
import a from "./a.pdf";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";

//~old working
function CreateBox({ id, onStart, color, children, position }) {
  return (
    <div
      id={id}
      className="dragger-element"
      onMouseDown={(e) => onStart(e, id)}
      onTouchStart={(e) => onStart(e, id)}
      style={{ borderColor: color, position: "absolute", left: position.x, top: position.y }}
    >
      {children}
    </div>
  );
}

const Ddm = () => {
  const column1 = [
    { label: "Invoice No", color: "#FFC107" },
    { label: "Invoice Date", color: "#3F51B5" },
    { label: "Account Id", color: "#8BC34A" },
    { label: "GST", color: "#FF5722" },
    { label: "Total", color: "#607D8B" },
  ];

  const column2 = [
    { label: " Code", color: "#4c53af99" },
    { label: " Description", color: "#E91E63" },
    { label: "Price", color: "#2196F3" },
    { label: "Unit", color: "#9C27B0" },
    { label: "Item Total", color: "#F44336" },
  ];

  const [boxes, setBoxes] = useState([]);
  const [boxPosition, setBoxPosition] = useState({});
  const [numPages, setNumPages] = useState(null);
  const [deltaPosition, setDeltaPosition] = useState({});

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  // Load saved positions on component mount
  useEffect(() => {
    const savedPositions = JSON.parse(localStorage.getItem("boxes"));
    if (savedPositions) {
      setBoxPosition(savedPositions);
    }
  }, []);

  //~oldworking
  // const handleColumnClick = (column, event) => {
  //   // Check if the id already exists in boxes array
  //   const isBoxExist = boxes.find((box) => box.id === column.label);
  //   if (!isBoxExist) {
  //     const newBox = {
  //       id: `${column.label}`,
  //       color: column.color,
  //     };
  //     setBoxes([...boxes, newBox]);
  //   }
  // };

  const handleColumnClick = (column, event) => {
    // Check if the id already exists in boxes array
    const isBoxExist = boxes.find((box) => box.id === column.label);
    if (!isBoxExist) {
      // Check if the box position is saved in local storage
      const boxPos = boxPosition[column.label];
      if (!boxPos) {
        // Create a new box with position (0, 0) and add it to local storage
        const newBox = {
          id: `${column.label}`,
          color: column.color,
          position: { x: 0, y: 0 },
        };
        setBoxPosition((prevBoxPos) => ({ ...prevBoxPos, [column.label]: newBox.position }));
        // localStorage.setItem("boxes", JSON.stringify({ ...boxPosition, [column.label]: newBox.position }));
        setBoxes([...boxes, newBox]);
      } else {
        // Add the box to the boxes array
        const newBox = {
          id: `${column.label}`,
          color: column.color,
          position: boxPos,
        };
        setBoxes([...boxes, newBox]);
      }
    }
  };

  const renderDraggable = (item) => {
    const { x = 0, y = 0 } = deltaPosition[item.label] || {};

    return (
      <Draggable defaultPosition={{ x, y }} onDrag={(e, ui) => handleDrag(e, ui, item)}>
        <div className="draggable" style={{ borderColor: item.color }}></div>
      </Draggable>
    );
  };

  // const handleDrag = (e, ui, item) => {

  //   console.log(item);
  //   console.log(e);
  //   const { x, y } = deltaPosition;
  //   setDeltaPosition({
  //     x: x + ui.deltaX,
  //     y: y + ui.deltaY,
  //   });
  // };
  const handleDrag = (e, ui, item) => {
    const draggerArea = document.querySelector(".dragger-area");
    if (!draggerArea) return;

    const draggerAreaRect = draggerArea.getBoundingClientRect();
    const draggerRect = e.target.getBoundingClientRect();

    const x = ui.deltaX + (draggerRect.left - draggerAreaRect.left);
    const y = ui.deltaY + (draggerRect.top - draggerAreaRect.top);

    setDeltaPosition((prevState) => ({ ...prevState, [item.label]: { x: x, y: y } }));
    // setBoxPosition((prevState) => ({ ...prevState, [item.label]: { x: x, y: y } }));
  };

  console.log(deltaPosition);

  console.log(boxPosition);

  function save() {
    // localStorage.setItem("myState", JSON.stringify(stateToSave));
    localStorage.setItem("boxes", JSON.stringify(deltaPosition));
  }

  return (
    <div className="flex p-16 gap-14 ">
      {/* <Pdf updateBoxPostion={setBoxPosition}>
        {(onStart) => {
          return boxes.map((box) => {
            return (
              <CreateBox
                key={box.id}
                id={box.id}
                onStart={onStart}
                color={box.color}
                position={boxPosition[box.id] || { x: 0, y: 0 }}
              />
            );
          });
        }}
      </Pdf> */}
      {/* <Pdf updateBoxPostion={setBoxPosition}>
        {(onStart) => {
          return boxes.map((box) => <CreateBox key={box.id} id={box.id} onStart={onStart} color={box.color} />);
        }}
      </Pdf> */}

      <div className="dragger-area" role="presentation">
        <Document file={a} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={1} />
        </Document>

        {column1.map((item, i) => {
          const bp = boxPosition[item.label];
          return (
            boxPosition[item.label] && (
              <Draggable onDrag={(e, ui) => handleDrag(e, ui, item)}>
                <li
                  key={i}
                  className={`cursor-grab rounded-md w-28 p-0.5 px-2  border absolute h-8  list-none `}
                  style={{ borderColor: item.color, top: bp?.y, left: bp?.x }}
                ></li>
              </Draggable>
            )
          );
        })}
      </div>
      <ul className="w-fit flex gap-2 flex-col">
        <h3 className="font-semibold">Invoice Fields</h3>
        {column1.map((item, i) => (
          <>
            <li
              key={i}
              className={`cursor-grab  p-0.5 px-2 rounded-md w-28  border-2 relative h-8`}
              style={{ borderColor: item.color }}
              // onClick={() => handleColumnClick(item)}
            >
              {item.label}
              {/* {renderDraggable(item)} */}
              {!boxPosition[item.label] && (
                <Draggable onDrag={(e, ui) => handleDrag(e, ui, item)}>
                  <li
                    key={i}
                    className={`cursor-grab rounded-md w-28 p-0.5 px-2  border absolute h-8 inset-0 -top-[2px] -left-[2px]
                  `}
                    style={{ borderColor: item.color }}
                  ></li>
                </Draggable>
              )}
            </li>
          </>
        ))}
        <hr />
        <h3 className="font-semibold">Line Items Label</h3>
        {column2.map((item, i) => (
          <li
            key={i}
            className={`cursor-grab  p-0.5 px-2 rounded-md w-28 border-2  `}
            style={{ borderColor: item.color }}
            onClick={() => handleColumnClick(item)}
          >
            {item.label}
          </li>
        ))}

        <button onClick={save} className="border p-1 rounded-md mt-4 hover:bg-slate-400">
          save
        </button>
      </ul>
    </div>
  );
};

export default Ddm;
