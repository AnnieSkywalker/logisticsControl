export function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function formatOrderNumber(orderAt, vehicleNumber) {
  const m = String(orderAt).match(
    /(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?/
  );
  if (!m) throw new Error("Некорректная дата и время");
  const [, year, month, day, hours, minutes, seconds = "00"] = m;
  return `${year}${month}${day}${hours}${minutes}${seconds}${digitsOnly(vehicleNumber)}`;
}
