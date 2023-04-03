import React, { useContext, useEffect, useState } from "react";
import upload from "../assets/pdfUpload.png";
import { useNavigate } from "react-router-dom";
import { FileContext } from "../context/FileContext";

const PdfUpload = () => {
  const [file, setFiles] = useState(null);
  const navigate = useNavigate();
  const { setPdf } = useContext(FileContext);
  useEffect(() => {
    if (file) {
      handleFormSubmit();
    }
  }, [file]);

  const handleFormSubmit = () => {
    if (file) {
      setPdf(file);
      navigate("/main");
    }
  };

  return (
    <form className="flex items-center justify-center h-screen">
      <label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer">
        <img src={upload} alt="pdf upload" className="max-h-16" />
        Upload your PDF
      </label>
      <input type="file" id="file-upload" className="hidden" onChange={(e) => setFiles(e.target.files[0])} />
    </form>
  );
};

export default PdfUpload;
