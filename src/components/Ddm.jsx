import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
// import a from "../assets/a.pdf";
import micah from "../assets/Micah.pdf";
// import ecm from "../assets/ecm.pdf";
import { column1, column2 } from "../constants";

const Ddm = () => {
  const [boxPosition, setBoxPosition] = useState({});
  const [numPages, setNumPages] = useState(null);
  const [deltaPosition, setDeltaPosition] = useState({});
  const canvasRef = useRef(null);
  const [initialBoxPosition, setInitialBoxPosition] = useState({});
  const [file, setFile] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const [xmlData, setXmlData] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  useEffect(() => {
    const savedPositions = JSON.parse(localStorage.getItem("savedPositions"));
    if (savedPositions) {
      setBoxPosition(savedPositions);
    }
  }, []);
  drawRectangle();

  const getCoordinates = (e) => {
    e.preventDefault();
    var myHeaders = new Headers();
    myHeaders.append("Cookie", "session-space-cookie=7b7fad6ad7e0127e1137f9890c2c4e95");

    var formdata = new FormData();
    console.log(file.files[0]);
    formdata.append("input", file.files[0]);
    formdata.append("teiCoordinates", "figure");
    formdata.append("teiCoordinates", "biblStruct");
    // const data = new Blob([micah], { type: "application/pdf" });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    fetch("https://kermitt2-grobid.hf.space/api/processFulltextDocument", requestOptions)
      .then((response) => response.text())
      .then((result) => setXmlData(result))
      .catch((error) => console.log("error", error));
  };

  // useEffect(() => {
  //   getCoordinates();
  // }, []);

  console.log(xmlData);
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlData && xmlData, "text/xml");
  const tableFigure = xml?.querySelector('figure[type="table"]');
  const coordsValue = tableFigure?.getAttribute("coords");
  const coords = coordsValue?.split(", ");

  function drawRectangle() {
    if (canvas) {
      const pdfCanvas = document.querySelector(".react-pdf__Page__canvas");
      const ctx = pdfCanvas.getContext("2d");

      // ctx.beginPath();
      // ctx.rect(36.0, 300.99, 519.28, 494.9);
      const [pageNumber, left, top, right, bottom] = [1, 36.0, 300.99, 519.28, 494.9];
      const viewport = pdfCanvas.parentNode.getBoundingClientRect();
      const scale = viewport.width / canvas.width;

      ctx.beginPath();
      ctx.rect(left * scale, (canvas.height - bottom) * scale, (right - left) * scale, (bottom - top) * scale);
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  }

  const drawLine = (startX, startY, endX, endY) => {
    const canvas1 = canvasRef?.current;
    const ctx = canvas1.getContext("2d");
    ctx.clearRect(0, 0, canvas1.width, canvas1.height);

    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  };

  const handleDrag = (e, ui, item) => {
    const listItem = e.target.parentNode;
    const { left, top } = listItem.getBoundingClientRect();
    setInitialBoxPosition((prev) => ({ ...prev, [item.label]: { x: left, y: top } }));

    const initialX = initialBoxPosition[item.label].x;
    const initialY = initialBoxPosition[item.label].y;

    const draggerArea = document.querySelector(".dragger-area");
    if (!draggerArea) return;

    const draggerAreaRect = draggerArea.getBoundingClientRect();
    const draggerRect = e.target.getBoundingClientRect();

    const x = ui.deltaX + (draggerRect.left - draggerAreaRect.left);
    const y = ui.deltaY + (draggerRect.top - draggerAreaRect.top);

    // setDeltaPosition((prevState) => ({ ...prevState, [item.label]: { x: x, y: y } }));
    // setDeltaPosition((prevState) => ({
    //   ...prevState,
    //   [item.label]: { x, y },
    //   ...boxPosition,
    // }));

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
    // drawLine(initialX, initialY, x, y);
  };

  function save() {
    localStorage.setItem("savedPositions", JSON.stringify(deltaPosition));
  }

  function onCanvasCreated(canvas) {
    setCanvas(canvas);
  }

  return (
    <div className="flex p-16 gap-14 " ref={canvasRef}>
      <div className="dragger-area" role="presentation">
        <Document file={micah} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={1} onRenderSuccess={onCanvasCreated} />
        </Document>

        {/* <canvas id="canvas" ref={canvasRef} style={{ position: "absolute", top: 0, left: 0 }} /> */}

        {column1.map((item, i) => {
          const bp = boxPosition[item.label];
          return (
            boxPosition[item.label] && (
              <Draggable onDrag={(e, ui) => handleDrag(e, ui, item)} key={i}>
                <li
                  key={i}
                  className={`cursor-grab rounded-md w-28 p-0.5 px-2  border absolute h-8  list-none `}
                  style={{ borderColor: item.color, top: bp?.y, left: bp?.x }}
                ></li>
              </Draggable>
            )
          );
        })}
        {column2.map((item, i) => {
          const bp = boxPosition[item.label];
          return (
            boxPosition[item.label] && (
              <Draggable onDrag={(e, ui) => handleDrag(e, ui, item)} key={i}>
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
          <li
            key={i}
            className={`cursor-grab  p-0.5 px-2 rounded-md w-28  border-2 relative h-8`}
            style={{ borderColor: item.color }}
          >
            {item.label}
            {!boxPosition[item.label] && (
              <Draggable onDrag={(e, ui) => handleDrag(e, ui, item)}>
                <span
                  key={i}
                  className={`cursor-grab rounded-md w-28 p-0.5 px-2  border absolute h-8 inset-0 -top-[2px] -left-[2px]
                  `}
                  style={{ borderColor: item.color }}
                />
              </Draggable>
            )}
          </li>
        ))}
        <hr />
        <h3 className="font-semibold">Line Items Label</h3>
        {column2.map((item, i) => (
          <li
            key={i}
            className={`cursor-grab  p-0.5 px-2 rounded-md w-28 border-2 relative h-8 `}
            style={{ borderColor: item.color }}
          >
            {item.label}

            {!boxPosition[item.label] && (
              <Draggable onDrag={(e, ui) => handleDrag(e, ui, item)}>
                <span
                  key={i}
                  className={`cursor-grab rounded-md w-28 p-0.5 px-2  border absolute h-8 inset-0 -top-[2px] -left-[2px]
                  `}
                  style={{ borderColor: item.color }}
                />
              </Draggable>
            )}
          </li>
        ))}

        <button onClick={save} className="border p-1 rounded-md mt-4 hover:bg-slate-400">
          save
        </button>

        <form onSubmit={getCoordinates}>
          <input type="file" onChange={(e) => setFile(e.target)} />
          <button type="submit">Submit</button>
        </form>
      </ul>
    </div>
  );
};

export default Ddm;
