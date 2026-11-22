import type { Env, SettingsRow } from "../_lib/env.ts";
import { json, error } from "../_lib/http.ts";
import { mapSettings } from "../_lib/map.ts";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const row = await context.env.DB.prepare(`SELECT * FROM shop_settings WHERE id = 1`).first<SettingsRow>();
    if (!row) return error("Settings not found", 404);
    return json({ settings: mapSettings(row) });
  } catch (err) {
    console.error(err);
    return error("Failed to load settings", 500);
  }
};
