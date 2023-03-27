import React, { useState, useEffect, useRef } from "react";

function Pdf1({ children, updateBoxPosition }) {
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pdfRef = useRef(null);

  const [draggedBoxId, setDraggedBoxId] = useState(null);

  useEffect(() => {
    const handleMouseUp = () => {
      setDragging(false);
      updateBoxPosition((prevState) => ({
        ...prevState,
        [draggedBoxId]: position,
      }));
    };

    const handleMouseMove = (event) => {
      event.preventDefault();
      if (dragging) {
        const x = event.clientX - offset.x;
        const y = event.clientY - offset.y;
        setPosition({ x, y });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, offset, position, updateBoxPosition]);

  const handleStart = (event, id) => {
    setDragging(true);
    setOffset({ x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY });
    setPosition({ x: event.clientX - event.nativeEvent.offsetX, y: event.clientY - event.nativeEvent.offsetY });
    setDraggedBoxId(id);
  };

  const handlePdfClick = (event) => {
    if (!event.target.classList.contains("dragger-element")) {
      setDragging(false);
    }
  };

  const handlePdfLoaded = () => {
    setPosition({
      x: pdfRef.current.offsetLeft,
      y: pdfRef.current.offsetTop,
    });
  };

  return (
    <div className="pdf-container" onClick={handlePdfClick}>
      <div className="pdf" ref={pdfRef} onLoad={handlePdfLoaded}>
        <div className="pdf-content">{children(handleStart)}</div>
      </div>
    </div>
  );
}

export default Pdf1;
