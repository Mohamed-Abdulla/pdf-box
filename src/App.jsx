import React, { useContext } from "react";
import PdfUpload from "./pages/PdfUpload";
import Main from "./pages/Main";
import { Routes, Route, Navigate } from "react-router-dom";
import { FileContext } from "./context/FileContext";

function App() {
  const { pdf } = useContext(FileContext);

  return (
    <Routes>
      <Route path="/" element={<PdfUpload />} />
      <Route path="/main" element={pdf != null ? <Main /> : <Navigate to="/" />} />
    </Routes>
  );
}

export default App;
