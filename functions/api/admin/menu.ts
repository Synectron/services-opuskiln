import { requireOwner } from "../../_lib/auth.ts";
import type { Env, MenuRow } from "../../_lib/env.ts";
import { error, json, readJson } from "../../_lib/http.ts";
import { mapMenuItem } from "../../_lib/map.ts";

const CATEGORIES = new Set(["chinese", "chaap", "tandoori", "momos"]);
const UNITS = new Set(["plate", "momo-12", "momo-6", "momo-5", "single"]);

type Body = {
  id?: string;
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

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

function validate(body: Body, partial = false): string | null {
  if (!partial || body.category != null) {
    if (!body.category || !CATEGORIES.has(body.category)) return "Invalid category";
  }
  if (!partial || body.name != null) {
    if (!body.name?.trim()) return "Name is required";
  }
  if (!partial || body.nameHi != null) {
    if (!body.nameHi?.trim()) return "Hindi name is required";
  }
  if (!partial || body.desc != null) {
    if (!body.desc?.trim()) return "Description is required";
  }
  if (!partial || body.descHi != null) {
    if (!body.descHi?.trim()) return "Hindi description is required";
  }
  if (!partial || body.half != null) {
    if (typeof body.half !== "number" || !Number.isInteger(body.half) || body.half <= 0) {
      return "Half price must be a positive integer";
    }
  }
  if (body.full != null) {
    if (typeof body.full !== "number" || !Number.isInteger(body.full) || body.full <= 0) {
      return "Full price must be a positive integer or null";
    }
  }
  if (!partial || body.unit != null) {
    if (!body.unit || !UNITS.has(body.unit)) return "Invalid unit";
  }
  if (body.half != null && body.full != null && body.full < body.half) {
    return "Full price must be >= half price";
  }
  return null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const session = await requireOwner(context.request, context.env);
  if (session instanceof Response) return session;
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM menu_items ORDER BY sort_order ASC, category ASC, name ASC`,
    ).all<MenuRow>();
    return json({ items: (results ?? []).map(mapMenuItem) });
  } catch (err) {
    console.error(err);
    return error("Failed to load menu", 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const session = await requireOwner(context.request, context.env);
  if (session instanceof Response) return session;

  const body = (await readJson<Body>(context.request)) ?? {};
  const invalid = validate(body);
  if (invalid) return error(invalid);

  const id = (body.id?.trim() || slugify(body.name!)).slice(0, 64);
  if (!id) return error("Could not derive item id");

  const existing = await context.env.DB.prepare(`SELECT id FROM menu_items WHERE id = ?`).bind(id).first();
  if (existing) return error("An item with this id already exists", 409);

  const sort =
    typeof body.sortOrder === "number"
      ? body.sortOrder
      : ((await context.env.DB.prepare(`SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM menu_items`).first<{
          next: number;
        }>())?.next ?? 0);

  try {
    await context.env.DB.prepare(
      `INSERT INTO menu_items
        (id, category, name, name_hi, desc_en, desc_hi, half, full, unit, bestseller, active, sort_order, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
      .bind(
        id,
        body.category,
        body.name!.trim(),
        body.nameHi!.trim(),
        body.desc!.trim(),
        body.descHi!.trim(),
        body.half,
        body.full ?? null,
        body.unit,
        body.bestseller ? 1 : 0,
        body.active === false ? 0 : 1,
        sort,
      )
      .run();

    const row = await context.env.DB.prepare(`SELECT * FROM menu_items WHERE id = ?`).bind(id).first<MenuRow>();
    return json({ item: mapMenuItem(row!) }, { status: 201 });
  } catch (err) {
    console.error(err);
    return error("Failed to create item", 500);
  }
};
