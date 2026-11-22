import type { Env, MenuRow } from "../_lib/env.ts";
import { json, error } from "../_lib/http.ts";
import { mapMenuItem } from "../_lib/map.ts";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM menu_items WHERE active = 1 ORDER BY sort_order ASC, category ASC, name ASC`,
    ).all<MenuRow>();
    return json({ items: (results ?? []).map(mapMenuItem) });
  } catch (err) {
    console.error(err);
    return error("Failed to load menu", 500);
  }
};
