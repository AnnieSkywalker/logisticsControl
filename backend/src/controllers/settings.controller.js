import db from "../models/db.js";

export async function getAll(req, res, next) {
  try {
    const rows = await db("settings").select("*");
    const map = {};
    for (const row of rows) map[row.key] = row.value;
    res.json(map);
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const entries = req.body;
    for (const [key, value] of Object.entries(entries)) {
      await db("settings").insert({ key, value }).onConflict("key").merge();
    }
    const rows = await db("settings").select("*");
    const map = {};
    for (const row of rows) map[row.key] = row.value;
    res.json(map);
  } catch (err) {
    next(err);
  }
}
