import { requireOwner } from "../../_lib/auth.ts";
import type { Env, SettingsRow } from "../../_lib/env.ts";
import { error, json, readJson } from "../../_lib/http.ts";
import { mapSettings } from "../../_lib/map.ts";

type Body = {
  name?: string;
  proprietor?: string;
  phoneDisplay?: string;
  phoneTel?: string;
  whatsapp?: string;
  addressLines?: string[];
  addressLinesHi?: string[];
  locality?: string;
  region?: string;
  postalCode?: string;
  mapQuery?: string;
  lat?: number;
  lng?: number;
  hoursEn?: string;
  hoursHi?: string;
  opens?: string;
  closes?: string;
  orderMinutes?: number;
  freeDelivery?: number;
  zomato?: string;
  swiggy?: string;
  magicpin?: string;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const session = await requireOwner(context.request, context.env);
  if (session instanceof Response) return session;
  const row = await context.env.DB.prepare(
    `SELECT * FROM shop_settings WHERE id = 1`,
  ).first<SettingsRow>();
  if (!row) return error("Settings not found", 404);
  return json({ settings: mapSettings(row) });
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const session = await requireOwner(context.request, context.env);
  if (session instanceof Response) return session;

  const current = await context.env.DB.prepare(
    `SELECT * FROM shop_settings WHERE id = 1`,
  ).first<SettingsRow>();
  if (!current) return error("Settings not found", 404);

  const body = (await readJson<Body>(context.request)) ?? {};
  const next = {
    name: body.name?.trim() || current.name,
    proprietor: body.proprietor?.trim() || current.proprietor,
    phone_display: body.phoneDisplay?.trim() || current.phone_display,
    phone_tel: body.phoneTel?.trim() || current.phone_tel,
    whatsapp: body.whatsapp?.trim() || current.whatsapp,
    address_lines: JSON.stringify(
      body.addressLines ?? JSON.parse(current.address_lines),
    ),
    address_lines_hi: JSON.stringify(
      body.addressLinesHi ?? JSON.parse(current.address_lines_hi),
    ),
    locality: body.locality?.trim() || current.locality,
    region: body.region?.trim() || current.region,
    postal_code: body.postalCode?.trim() || current.postal_code,
    map_query: body.mapQuery?.trim() || current.map_query,
    lat: body.lat ?? current.lat,
    lng: body.lng ?? current.lng,
    hours_en: body.hoursEn?.trim() || current.hours_en,
    hours_hi: body.hoursHi?.trim() || current.hours_hi,
    opens: body.opens?.trim() || current.opens,
    closes: body.closes?.trim() || current.closes,
    order_minutes: body.orderMinutes ?? current.order_minutes,
    free_delivery: body.freeDelivery ?? current.free_delivery,
    zomato: body.zomato?.trim() || current.zomato,
    swiggy: body.swiggy?.trim() || current.swiggy,
    magicpin: body.magicpin?.trim() || current.magicpin || "",
  };

  if (!Number.isInteger(next.free_delivery) || next.free_delivery < 0) {
    return error("freeDelivery must be a non-negative integer");
  }
  if (!Number.isInteger(next.order_minutes) || next.order_minutes <= 0) {
    return error("orderMinutes must be a positive integer");
  }

  try {
    await context.env.DB.prepare(
      `UPDATE shop_settings SET
        name = ?, proprietor = ?, phone_display = ?, phone_tel = ?, whatsapp = ?,
        address_lines = ?, address_lines_hi = ?, locality = ?, region = ?, postal_code = ?,
        map_query = ?, lat = ?, lng = ?, hours_en = ?, hours_hi = ?, opens = ?, closes = ?,
        order_minutes = ?, free_delivery = ?, zomato = ?, swiggy = ?, magicpin = ?, updated_at = datetime('now')
       WHERE id = 1`,
    )
      .bind(
        next.name,
        next.proprietor,
        next.phone_display,
        next.phone_tel,
        next.whatsapp,
        next.address_lines,
        next.address_lines_hi,
        next.locality,
        next.region,
        next.postal_code,
        next.map_query,
        next.lat,
        next.lng,
        next.hours_en,
        next.hours_hi,
        next.opens,
        next.closes,
        next.order_minutes,
        next.free_delivery,
        next.zomato,
        next.swiggy,
        next.magicpin,
      )
      .run();

    const row = await context.env.DB.prepare(
      `SELECT * FROM shop_settings WHERE id = 1`,
    ).first<SettingsRow>();
    return json({ settings: mapSettings(row!) });
  } catch (err) {
    console.error(err);
    return error("Failed to update settings", 500);
  }
};
