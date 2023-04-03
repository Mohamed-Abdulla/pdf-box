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
      const reader = new FileReader();
      reader.onload = () => {
        setFiles(reader.result);
      };
      reader.readAsDataURL(file);
      setPdf(file);
      navigate("/main");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-center text-xl font-semibold">Labelling Invoice</h1>
      <form className="flex items-center justify-center mt-6 ">
        <label htmlFor="file-upload" className="flex flex-col items-center gap-2 cursor-pointer">
          <img src={upload} alt="pdf upload" className="max-h-16" />
          Please Upload your Invoice
        </label>
        <input type="file" id="file-upload" className="hidden" onChange={(e) => setFiles(e.target.files[0])} />
      </form>
    </div>
  );
};

export default PdfUpload;
