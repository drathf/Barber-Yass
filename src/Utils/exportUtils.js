// src/utils/exportUtils.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/galeria/logo.png";

export async function exportToExcel(reservas) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Reservas");

  sheet.columns = [
    { header: "Fecha", key: "fecha", width: 15 },
    { header: "Hora", key: "hora", width: 10 },
    { header: "Cliente", key: "nombre", width: 25 },
    { header: "Servicio", key: "servicio", width: 20 },
    { header: "Precio", key: "precio", width: 10 },
    { header: "Estado", key: "estado", width: 15 },
  ];

  reservas.forEach((r) => {
    sheet.addRow({
      fecha: r.fecha,
      hora: r.hora,
      nombre: r.nombre || "",
      servicio: r.servicio || "",
      precio: r.precio || 0,
      estado: r.estado || "",
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), "Reporte_BarberYass_RangoFechas.xlsx");
}

export async function exportToPDF(reservas, total, ganancias) {
  const doc = new jsPDF();
  const img = new Image();
  img.src = logo;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  doc.addImage(img, "PNG", 10, 8, 30, 30);
  doc.setFontSize(16);
  doc.text("Reporte de Reservas – BarberYass", 50, 20);
  doc.setFontSize(10);
  doc.text(`Total de Reservas: ${total} | Ganancia Total: S/. ${ganancias}`, 50, 26);

  const tableData = reservas.map((r) => [
    r.fecha,
    r.hora,
    r.nombre || "",
    r.servicio || "",
    `S/. ${r.precio || 0}`,
    r.estado || "",
  ]);

  autoTable(doc, {
    startY: 40,
    head: [["Fecha", "Hora", "Cliente", "Servicio", "Precio", "Estado"]],
    body: tableData,
    styles: {
      fontSize: 9,
      halign: "center",
    },
    headStyles: {
      fillColor: [92, 84, 255], // color lila
      textColor: "#fff",
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [245, 245, 245] },
  });

  doc.save("Reporte_BarberYass_RangoFechas.pdf");
}
