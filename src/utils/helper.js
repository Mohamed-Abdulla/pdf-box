export const parseXml = (xmlData) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlData && xmlData, "text/xml");
  // const tableFigure = xml?.querySelector('figure[type="table"]');
  const tableFigure = xml?.querySelector("table");
  const coordsValue = tableFigure?.getAttribute("coords");
  const coords = coordsValue?.split(", ");
  const result = coords[0]?.split(",")?.map(Number);

  return { result, tableFigure };
};
