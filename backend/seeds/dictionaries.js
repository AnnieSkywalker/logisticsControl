const DICTIONARIES = [
  ["legal_entities", "name", [
    "ООО «Ромашка»",
    "АО «Гранит»",
    "ИП Иванов И.И.",
  ]],
  ["loading_sites", "name", [
    "Карьер Северный",
    "Карьер Южный",
    "Склад №1",
  ]],
  ["destination_sites", "name", [
    "Объект «Москва-Сити»",
    "АБЗ Центральный",
    "Порт Восточный",
  ]],
  ["fractions", "name", [
    "Щебень 5-20",
    "Щебень 20-40",
    "Отсев 0-5",
    "Песок",
  ]],
  ["vehicles", "number", [
    "А123БВ777",
    "В456ЕК199",
    "Е789МН50",
  ]],
];

const VOLUMES = [10, 15, 20, 25, 30];

export async function seed(knex) {
  let inserted = false;

  for (const [table, field, values] of DICTIONARIES) {
    const existing = await knex(table).count("* as c").first();
    if (existing.c > 0) continue;
    await knex(table).insert(
      values.map((value, i) => ({ [field]: value, sort_order: i + 1 }))
    );
    inserted = true;
  }

  const volumesExisting = await knex("volumes").count("* as c").first();
  if (volumesExisting.c === 0) {
    await knex("volumes").insert(
      VOLUMES.map((value, i) => ({ value, unit: "т", sort_order: i + 1 }))
    );
    inserted = true;
  }

  console.log(inserted ? "Справочники заполнены примерами" : "Справочники уже заполнены — сид пропущен");
}
