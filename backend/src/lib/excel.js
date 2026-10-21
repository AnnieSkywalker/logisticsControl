import ExcelJS from "exceljs";

const COLUMNS = [
  { header: "Номер заявки", key: "order_number", width: 24 },
  { header: "Дата и время", key: "order_at", width: 18 },
  { header: "Юр. лицо", key: "legal_entity", width: 26 },
  { header: "Площадка отгрузки", key: "loading_site", width: 26 },
  { header: "Площадка доставки", key: "destination_site", width: 26 },
  { header: "Фракция", key: "fraction", width: 18 },
  { header: "Объём, т", key: "volume", width: 12 },
  { header: "Номер авто", key: "vehicle", width: 16 },
  { header: "Комментарий", key: "comment", width: 32 },
  { header: "Создано", key: "created_at", width: 20 },
];

function formatDt(value) {
  return String(value ?? "").replace("T", " ");
}

export async function buildOrdersWorkbook(orders) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Logistics Control";
  const ws = wb.addWorksheet("Заявки");
  ws.columns = COLUMNS;
  ws.getRow(1).font = { bold: true };

  for (const o of orders) {
    ws.addRow({
      order_number: o.order_number,
      order_at: formatDt(o.order_at),
      legal_entity: o.legal_entity,
      loading_site: o.loading_site,
      destination_site: o.destination_site,
      fraction: o.fraction,
      volume: o.volume,
      vehicle: o.vehicle,
      comment: o.comment || "",
      created_at: formatDt(o.created_at),
    });
  }

  return wb.xlsx.writeBuffer();
}
