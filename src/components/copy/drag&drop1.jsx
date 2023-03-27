import Pdf from "./Pdf";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
import a from "./a.pdf";
import { useEffect, useState } from "react";

const DragDrop1 = () => {
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
    { label: "  Total", color: "#F44336" },
  ];

  const [numPages, setNumPages] = useState(null);
  const [listItems, setListItems] = useState(column1);
  const [itemPositions, setItemPositions] = useState({});

  const [activeItem, setActiveItem] = useState(null);
  const [canvasData, setCanvasData] = useState([]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }
  function handleDragStart(e, index) {
    const data = JSON.stringify(index);
    e.dataTransfer.setData("text/plain", data);
  }
  let offsetX;
  let offsetY;

  const handleDrop = (e) => {
    e.preventDefault();
    // Get the index of the item being dropped
    const data = e.dataTransfer.getData("text/plain");
    const index = JSON.parse(data);
    // Get the PDF canvas element
    const pdfCanvas = document.querySelector(".react-pdf__Page__canvas");
    // Get the coordinates of the drop position relative to the canvas
    const rect = pdfCanvas.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Set the starting position for the dragged element
    offsetX = x;
    offsetY = y;
    // Render the dropped item onto the PDF using the canvas context
    const context = pdfCanvas.getContext("2d");
    context.font = "16px Arial";
    // context.fillText(index, x, y);
    context.lineJoin = "round";
    context.lineCap = "round";
    context.strokeStyle = index.color;
    context.zIndex = 2;
    const width = context.measureText(index.label).width;
    context.strokeRect(x, y - 20, width, 20);

    const rectangleElement = document.createElement("div");
    rectangleElement.style.position = "absolute";
    rectangleElement.style.left = `${x}px`;
    rectangleElement.style.top = `${y - 20}px`;
    rectangleElement.style.width = `${width}px`;
    rectangleElement.style.height = "20px";
    rectangleElement.style.cursor = "pointer";
    rectangleElement.addEventListener("click", () => handleRectangleClick(index.label));

    pdfCanvas.parentNode.appendChild(rectangleElement);

    // Get the pixel data for the area that the box occupies
    const imageData = context.getImageData(x, y - 20, context.measureText(index.label).width, 20);

    const newListItems = [...listItems];
    newListItems.splice(index, 1);
    setListItems(newListItems);

    // Update the positions object with the initial position of the dropped element
    const newPositions = { ...itemPositions };
    newPositions[index.label] = { x, y };
    setItemPositions(newPositions);
  };

  const handleMouseMove = (e) => {
    console.log(e);
    if (activeItem) {
      const newPositions = { ...itemPositions };
      newPositions[activeItem] = { x: e.clientX - offsetX, y: e.clientY - offsetY };
      setItemPositions(newPositions);
    }
  };

  const handleMouseUp = () => {
    setActiveItem(null);
  };
  console.table(itemPositions);

  const handleRectangleClick = (index) => {
    setActiveItem(index);
  };
  console.log(activeItem);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // const rectStyle = activeItem === item.label ? { cursor: "grabbing" } : { cursor: "grab" };
  return (
    <div className="max-w-7xl px-16 p-6 flex justify-evenly items-start">
      <div onDrop={handleDrop} onDragOver={handleDragOver}>
        <Document file={a} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={1} />
        </Document>
      </div>
      <div className="mr-4 w-0.5 h-screen bg-gray-400" />
      <ul className="w-fit flex gap-2 flex-col">
        <h3 className="font-semibold">Invoice Fields</h3>
        {column1.map((item, i) => (
          <li
            key={i}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, item)}
            className={`cursor-grab  p-0.5 px-2 rounded-md w-28  border-2 `}
            style={{ borderColor: item.color }}
          >
            {item.label}
          </li>
        ))}
        <hr />
        <h3 className="font-semibold">Line Items Label</h3>
        {column2.map((item, i) => (
          <li
            key={i}
            draggable={true}
            onDragStart={(e) => handleDragStart(e, item)}
            className={`cursor-grab  p-0.5 px-2 rounded-md w-28 border-2  `}
            style={{ borderColor: item.color }}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DragDrop1;
