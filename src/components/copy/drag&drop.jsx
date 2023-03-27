import Pdf from "./Pdf";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
import a from "./a.pdf";
import { useState } from "react";

const DragDrop = () => {
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
    let x = e.clientX - rect.left - offsetX;
    let y = e.clientY - rect.top - offsetY;

    // Render the dropped item onto the PDF using the canvas context
    const context = pdfCanvas.getContext("2d");
    context.font = "16px Arial";
    context.lineJoin = "round";
    context.lineCap = "round";
    context.strokeStyle = index.color;
    context.zIndex = 2;
    context.strokeRect(x, y - 20, context.measureText(index.label).width, 20);

    // Get the pixel data for the area that the box occupies

    const newListItems = [...listItems];
    newListItems.splice(index, 1);
    setListItems(newListItems);

    // Update the positions object with the initial position of the dropped element
    const newPositions = { ...itemPositions };
    newPositions[index.label] = { x, y };
    setItemPositions(newPositions);
  };

  // const handleDrop = (e) => {
  //   e.preventDefault();
  //   // Get the index of the item being dropped
  //   const data = e.dataTransfer.getData("text/plain");
  //   const index = JSON.parse(data);
  //   // Get the PDF canvas element
  //   const pdfCanvas = document.querySelector(".react-pdf__Page__canvas");
  //   // Get the coordinates of the drop position relative to the canvas
  //   const rect = pdfCanvas.getBoundingClientRect();
  //   let x = e.clientX - rect.left;
  //   let y = e.clientY - rect.top;

  //   // Set the starting position for the dragged element
  //   offsetX = x;
  //   offsetY = y;

  //   // Create a new canvas element and position it on top of the PDF canvas
  //   const canvas = document.createElement("canvas");
  //   canvas.width = pdfCanvas.width;
  //   canvas.height = pdfCanvas.height;
  //   canvas.style.position = "absolute";
  //   canvas.style.left = pdfCanvas.offsetLeft + "px";
  //   canvas.style.top = pdfCanvas.offsetTop + "px";

  //   // Render the dropped item onto the new canvas using the canvas context
  //   const context = canvas.getContext("2d");
  //   context.font = "16px Arial";
  //   context.lineJoin = "round";
  //   context.lineCap = "round";
  //   context.strokeStyle = index.color;
  //   context.strokeRect(x, y - 20, context.measureText(index.label).width, 20);

  //   // Get the pixel data for the area that the rectangle occupies
  //   const imageData = context.getImageData(x, y - 20, context.measureText(index.label).width, 20);

  //   // Update the positions object with the initial position of the dropped element
  //   const newPositions = { ...itemPositions };
  //   newPositions[index.label] = { x, y };
  //   setItemPositions(newPositions);

  //   // Save the new canvas and its associated data to state
  //   const newCanvasData = { canvas, imageData, index };
  //   setCanvasData([...canvasData, newCanvasData]);

  //   // Update the list of available items to remove the dropped item
  //   const newListItems = [...listItems];
  //   newListItems.splice(column1.indexOf(index), 1);
  //   setListItems(newListItems);
  // };

  console.table(itemPositions);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="max-w-7xl px-16 p-6 flex justify-evenly items-start">
      <div onDrop={handleDrop} onDragOver={handleDragOver} className="h-[70vh]">
        <Document file={a} onLoadSuccess={onDocumentLoadSuccess} className="h-full">
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

export default DragDrop;
