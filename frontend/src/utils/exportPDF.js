import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = (data, fileName = "Report") => {
  const doc = new jsPDF();

  if (!data || data.length === 0) {
    doc.text("No Data Available", 14, 20);
    doc.save(`${fileName}.pdf`);
    return;
  }

  const columns = Object.keys(data[0]);

  const rows = data.map((item) =>
    columns.map((column) => item[column])
  );

  doc.setFontSize(18);
  doc.text(fileName, 14, 15);

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 25,
  });

  doc.save(`${fileName}.pdf`);
};