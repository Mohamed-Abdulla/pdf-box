import { createContext, useState } from "react";

export const FileContext = createContext();

function FileContextProvider(props) {
  const [pdf, setPdf] = useState(null);
  return <FileContext.Provider value={{ pdf, setPdf }}>{props.children}</FileContext.Provider>;
}

export default FileContextProvider;
