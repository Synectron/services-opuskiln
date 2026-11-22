import { requireOwner } from "../../../_lib/auth.ts";
import type { Env, MenuRow } from "../../../_lib/env.ts";
import { error, json, readJson } from "../../../_lib/http.ts";
import { mapMenuItem } from "../../../_lib/map.ts";

const CATEGORIES = new Set(["chinese", "chaap", "tandoori", "momos"]);
const UNITS = new Set(["plate", "momo-12", "momo-6", "momo-5", "single"]);

type Body = {
  category?: string;
  name?: string;
  nameHi?: string;
  desc?: string;
  descHi?: string;
  half?: number;
  full?: number | null;
  unit?: string;
  bestseller?: boolean;
  active?: boolean;
  sortOrder?: number;
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const session = await requireOwner(context.request, context.env);
  if (session instanceof Response) return session;

  const id = context.params.id;
  if (!id || typeof id !== "string") return error("Missing id");

  const current = await context.env.DB.prepare(`SELECT * FROM menu_items WHERE id = ?`).bind(id).first<MenuRow>();
  if (!current) return error("Item not found", 404);

  const body = (await readJson<Body>(context.request)) ?? {};
  const category = body.category ?? current.category;
  const name = body.name?.trim() ?? current.name;
  const nameHi = body.nameHi?.trim() ?? current.name_hi;
  const desc = body.desc?.trim() ?? current.desc_en;
  const descHi = body.descHi?.trim() ?? current.desc_hi;
  const half = body.half ?? current.half;
  const full = body.full === undefined ? current.full : body.full;
  const unit = body.unit ?? current.unit;
  const bestseller = body.bestseller === undefined ? current.bestseller : body.bestseller ? 1 : 0;
  const active = body.active === undefined ? current.active : body.active ? 1 : 0;
  const sortOrder = body.sortOrder ?? current.sort_order;

  if (!CATEGORIES.has(category)) return error("Invalid category");
  if (!UNITS.has(unit)) return error("Invalid unit");
  if (!name || !nameHi || !desc || !descHi) return error("Name and descriptions are required");
  if (!Number.isInteger(half) || half <= 0) return error("Half price must be a positive integer");
  if (full != null && (!Number.isInteger(full) || full < half)) return error("Full price must be >= half");

  try {
    await context.env.DB.prepare(
      `UPDATE menu_items SET
        category = ?, name = ?, name_hi = ?, desc_en = ?, desc_hi = ?,
        half = ?, full = ?, unit = ?, bestseller = ?, active = ?, sort_order = ?,
        updated_at = datetime('now')
       WHERE id = ?`,
    )
      .bind(category, name, nameHi, desc, descHi, half, full, unit, bestseller, active, sortOrder, id)
      .run();

    const row = await context.env.DB.prepare(`SELECT * FROM menu_items WHERE id = ?`).bind(id).first<MenuRow>();
    return json({ item: mapMenuItem(row!) });
  } catch (err) {
    console.error(err);
    return error("Failed to update item", 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const session = await requireOwner(context.request, context.env);
  if (session instanceof Response) return session;

  const id = context.params.id;
  if (!id || typeof id !== "string") return error("Missing id");

  try {
    // Soft-delete: keep history, hide from public menu
    const result = await context.env.DB.prepare(
      `UPDATE menu_items SET active = 0, updated_at = datetime('now') WHERE id = ?`,
    )
      .bind(id)
      .run();
    if (!result.meta.changes) return error("Item not found", 404);
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return error("Failed to deactivate item", 500);
  }
};
