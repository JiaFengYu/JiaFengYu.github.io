import React from "react";

const PDFViewer = ({ pdf }) => {
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <iframe
        src={../data/jiafeng.pdf}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="PDF Viewer"
      ></iframe>
    </div>
  );
};

export default PDFViewer;
