import db from "../models/db.js";

const TYPES = {
  "legal-entities": { table: "legal_entities", fields: ["name"], required: ["name"] },
  "loading-sites": { table: "loading_sites", fields: ["name"], required: ["name"] },
  "destination-sites": { table: "destination_sites", fields: ["name"], required: ["name"] },
  fractions: { table: "fractions", fields: ["name"], required: ["name"] },
  volumes: { table: "volumes", fields: ["value", "unit"], required: ["value"] },
  vehicles: { table: "vehicles", fields: ["number"], required: ["number"] },
};

const USAGE_COLUMN = {
  legal_entities: "legal_entity_id",
  loading_sites: "loading_site_id",
  destination_sites: "destination_site_id",
  fractions: "fraction_id",
  volumes: "volume_id",
  vehicles: "vehicle_id",
};

function resolve(type) {
  const cfg = TYPES[type];
  if (!cfg) {
    const err = new Error("Неизвестный справочник");
    err.status = 404;
    throw err;
  }
  return cfg;
}

function pick(cfg, body) {
  const data = {};
  for (const field of cfg.fields) {
    if (body[field] !== undefined) data[field] = body[field];
  }
  if (cfg.table === "volumes" && data.value !== undefined) {
    data.value = Number(data.value);
  }
  return data;
}

export async function list(req, res, next) {
  try {
    const cfg = resolve(req.params.type);
    const rows = await db(cfg.table).orderBy([
      { column: "sort_order" },
      { column: "id" },
    ]);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const cfg = resolve(req.params.type);
    const data = pick(cfg, req.body);
    for (const field of cfg.required) {
      if (data[field] === undefined || data[field] === "" || Number.isNaN(data[field])) {
        return res.status(400).json({ error: `Поле "${field}" обязательно` });
      }
    }
    if (req.body.sort_order !== undefined) data.sort_order = Number(req.body.sort_order);
    const [id] = await db(cfg.table).insert(data);
    const row = await db(cfg.table).where({ id }).first();
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const cfg = resolve(req.params.type);
    const row = await db(cfg.table).where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Запись не найдена" });

    const data = pick(cfg, req.body);
    if (req.body.is_active !== undefined) data.is_active = !!req.body.is_active;
    if (req.body.sort_order !== undefined) data.sort_order = Number(req.body.sort_order);

    if (Object.keys(data).length) {
      await db(cfg.table).where({ id: row.id }).update(data);
    }
    const updated = await db(cfg.table).where({ id: row.id }).first();
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const cfg = resolve(req.params.type);
    const row = await db(cfg.table).where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Запись не найдена" });

    const column = USAGE_COLUMN[cfg.table];
    if (column) {
      const used = await db("shipment_orders").where({ [column]: row.id }).count("* as c").first();
      if (used.c > 0) {
        return res.status(409).json({
          error: `Нельзя удалить: значение используется в ${used.c} заявках. Отключите его вместо удаления.`,
        });
      }
    }

    await db(cfg.table).where({ id: row.id }).del();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
