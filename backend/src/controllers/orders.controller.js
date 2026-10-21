import db from "../models/db.js";
import { formatOrderNumber } from "../lib/orderNumber.js";
import { buildOrdersWorkbook } from "../lib/excel.js";

const REQUIRED = [
  "legal_entity_id",
  "order_at",
  "loading_site_id",
  "destination_site_id",
  "fraction_id",
  "volume_id",
  "vehicle_id",
];

const EDITABLE = [
  "legal_entity_id",
  "order_at",
  "loading_site_id",
  "destination_site_id",
  "fraction_id",
  "volume_id",
  "vehicle_id",
];

function baseQuery() {
  return db("shipment_orders as o")
    .leftJoin("legal_entities as le", "le.id", "o.legal_entity_id")
    .leftJoin("loading_sites as ls", "ls.id", "o.loading_site_id")
    .leftJoin("destination_sites as ds", "ds.id", "o.destination_site_id")
    .leftJoin("fractions as fr", "fr.id", "o.fraction_id")
    .leftJoin("volumes as vo", "vo.id", "o.volume_id")
    .leftJoin("vehicles as ve", "ve.id", "o.vehicle_id")
    .select(
      "o.id",
      "o.order_number",
      "o.order_at",
      "o.comment",
      "o.created_at",
      "o.updated_at",
      "o.legal_entity_id",
      "o.loading_site_id",
      "o.destination_site_id",
      "o.fraction_id",
      "o.volume_id",
      "o.vehicle_id",
      "le.name as legal_entity",
      "ls.name as loading_site",
      "ds.name as destination_site",
      "fr.name as fraction",
      "vo.value as volume",
      "vo.unit as volume_unit",
      "ve.number as vehicle"
    );
}

function applyFilters(query, q) {
  if (q.vehicle_id) query.where("o.vehicle_id", q.vehicle_id);
  if (q.legal_entity_id) query.where("o.legal_entity_id", q.legal_entity_id);
  if (q.date) query.whereRaw("substr(o.order_at, 1, 10) = ?", [q.date]);
  if (q.date_from) query.where("o.order_at", ">=", `${q.date_from}T00:00`);
  if (q.date_to) query.where("o.order_at", "<=", `${q.date_to}T23:59:59`);
  return query;
}

async function nextOrderNumber(orderAt, vehicleId) {
  const vehicle = await db("vehicles").where({ id: vehicleId }).first();
  if (!vehicle) {
    const err = new Error("Автомобиль не найден");
    err.status = 400;
    throw err;
  }
  const base = formatOrderNumber(orderAt, vehicle.number);
  let candidate = base;
  let counter = 1;
  while (await db("shipment_orders").where({ order_number: candidate }).first()) {
    counter += 1;
    candidate = base + String(counter);
  }
  return candidate;
}

export async function create(req, res, next) {
  try {
    const body = req.body;
    for (const field of REQUIRED) {
      if (body[field] === undefined || body[field] === null || body[field] === "") {
        return res.status(400).json({ error: `Поле "${field}" обязательно` });
      }
    }

    const order_number = await nextOrderNumber(body.order_at, body.vehicle_id);
    const [id] = await db("shipment_orders").insert({
      order_number,
      legal_entity_id: body.legal_entity_id,
      order_at: body.order_at,
      loading_site_id: body.loading_site_id,
      destination_site_id: body.destination_site_id,
      fraction_id: body.fraction_id,
      volume_id: body.volume_id,
      vehicle_id: body.vehicle_id,
      comment: body.comment || null,
    });

    const row = await baseQuery().where("o.id", id).first();
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 200));
    const offset = (page - 1) * limit;

    const totalRow = await applyFilters(
      db("shipment_orders as o").count("* as c"),
      req.query
    ).first();

    const items = await applyFilters(baseQuery(), req.query)
      .orderBy("o.order_at", "desc")
      .orderBy("o.id", "desc")
      .limit(limit)
      .offset(offset);

    res.json({ items, total: totalRow.c, page, limit });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const row = await baseQuery().where("o.id", req.params.id).first();
    if (!row) return res.status(404).json({ error: "Заявка не найдена" });
    res.json(row);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const row = await db("shipment_orders").where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Заявка не найдена" });

    const body = req.body;
    const data = {};
    for (const field of EDITABLE) {
      if (body[field] !== undefined) data[field] = body[field];
    }
    if (body.comment !== undefined) data.comment = body.comment || null;

    const newOrderAt = data.order_at ?? row.order_at;
    const newVehicleId = data.vehicle_id ?? row.vehicle_id;
    if (newOrderAt !== row.order_at || newVehicleId !== row.vehicle_id) {
      data.order_number = await nextOrderNumber(newOrderAt, newVehicleId);
    }

    data.updated_at = new Date();
    await db("shipment_orders").where({ id: row.id }).update(data);

    const updated = await baseQuery().where("o.id", row.id).first();
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const row = await db("shipment_orders").where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: "Заявка не найдена" });
    await db("shipment_orders").where({ id: row.id }).del();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function exportOrders(req, res, next) {
  try {
    const items = await applyFilters(baseQuery(), req.query)
      .orderBy("o.order_at", "desc")
      .orderBy("o.id", "desc");

    const buffer = await buildOrdersWorkbook(items);
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="orders-${stamp}.xlsx"`
    );
    res.send(Buffer.from(buffer));
  } catch (err) {
    next(err);
  }
}
