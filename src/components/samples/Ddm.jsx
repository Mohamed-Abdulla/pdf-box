import React, { useState, useEffect, useRef } from "react";
import Draggable from "react-draggable";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
import a from "../assets/a.pdf";
import micah from "../assets/Micah.pdf";
// import ecm from "../assets/ecm.pdf";
import { column1, column2 } from "../../constants";
import { parseXml } from "../../utils/helper";
import axios from "axios";
import fastXmlParser from "fast-xml-parser";

const Ddm = () => {
  const [boxPosition, setBoxPosition] = useState({});
  const [numPages, setNumPages] = useState(null);
  const [deltaPosition, setDeltaPosition] = useState({});
  const canvasRef = useRef(null);
  const [initialBoxPosition, setInitialBoxPosition] = useState({});
  const [canvas, setCanvas] = useState(null);
  const [xmlData, setXmlData] = useState(null);
  const [table, setTable] = useState({});
  const [coOrds, setCoOrds] = useState({});
  const [pdfFile, setPdfFile] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const getCoordinates = async () => {
    if (pdfFile) {
      let myHeaders = new Headers();
      myHeaders.append("Cookie", "session-space-cookie=7b7fad6ad7e0127e1137f9890c2c4e95");
      let formData = new FormData();

      formData.append("input", pdfFile, "MyPdf.pdf");
      formData.append("teiCoordinates", "figure");
      formData.append("teiCoordinates", "biblStruct");

      try {
        const res = await axios.post("https://kermitt2-grobid.hf.space/api/processFulltextDocument", formData, {
          headers: myHeaders,
        });
        setXmlData(res.data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    const handleFileSelect = async () => {
      const response = await fetch(micah);
      const data = await response.blob();
      const file = new File([data], "MyPdf.pdf", { type: "application/pdf" });
      setPdfFile(file);
    };

    handleFileSelect();
  }, []);

  useEffect(() => {
    const savedPositions = JSON.parse(localStorage.getItem("savedPositions"));
    if (savedPositions) {
      setBoxPosition(savedPositions);
    }

    getCoordinates();
    getTable();
    drawRectangle();
  }, [pdfFile, xmlData]);

  function findCategory(obj) {
    for (let key in obj) {
      if (key === "table") {
        return obj[key];
      } else if (typeof obj[key] === "object") {
        const result = findCategory(obj[key]);
        if (result) {
          return result;
        }
      }
    }
    return null;
  }

  function getTable() {
    if (xmlData !== null) {
      const fxp = new fastXmlParser.XMLParser();
      const parsedData = fxp.parse(xmlData);

      const tableData = findCategory(parsedData);

      setTable(tableData);
    }
  }

  function drawRectangle() {
    if (canvas) {
      if (xmlData !== null) {
        const data = parseXml(xmlData);
        setCoOrds({
          left: data?.result[1],
          top: data?.result[2],
          right: data?.result[3],
          bottom: data?.result[4],
        });
      }
      // const pdfCanvas = document.querySelector(".react-pdf__Page__canvas");
      // const ctx = pdfCanvas.getContext("2d");
      // const [pageNumber, left, top, right, bottom] = coOrds;
      // // const viewport = pdfCanvas.parentNode.getBoundingClientRect();
      // ctx.beginPath();
      // ctx.rect(left * 2, top * 2, right * 2, bottom * 2);
      // ctx.strokeStyle = "#000";
      // ctx.lineWidth = 3;
      // ctx.stroke();
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

  console.log(table);

  return (
    <div className="flex p-14 gap-14 ">
      <div className="dragger-area" role="presentation">
        <Document file={micah} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={1} onRenderSuccess={onCanvasCreated} width={595} />
        </Document>

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

        {table != null ? (
          <table
            className={`absolute text-[8px] border border-red-600 `}
            style={{ left: coOrds?.left, top: coOrds?.top, height: coOrds?.top, width: coOrds?.right }}
          >
            <tbody className="invisible">
              {table?.row?.slice(0, -6).map((item, index) => (
                <tr key={index} className={index < 3 ? "invisible " : ""}>
                  {item?.cell.map((cellItem, cellIndex) => (
                    <td key={cellIndex} className={`${cellItem !== "" && index > 2 ? "border border-red-600" : ""}`}>
                      {cellItem}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <>{console.log("no table found")}</>
        )}
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
        {table != null ? (
          <table
            className={` text-[14px] border border-gray-900 bg-slate-50`}
            style={{ height: coOrds?.top, width: coOrds?.right }}
          >
            <tbody className="text-center">
              {table?.row?.map((item, index) => {
                return (
                  <tr key={index}>
                    {item?.cell.map((cellItem, cellIndex) => (
                      <td key={cellIndex} className={`border border-gray-900`}>
                        {cellItem}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <>{console.log("no table found")}</>
        )}
        {/* {column2.map((item, i) => (
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
        ))} */}

        <button onClick={save} className="border p-1 rounded-md mt-4 hover:bg-slate-400">
          save
        </button>

        {/* <form onSubmit={getCoordinates}>
          <input type="file" onChange={(e) => setFile(e.target)} />
          <button type="submit">Submit</button>
        </form> */}
      </ul>
    </div>
  );
};

export default Ddm;
