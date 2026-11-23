import { readCustomerSession } from "../_lib/auth.ts";
import { normalizePhone } from "../_lib/customers.ts";
import type { Env, MenuRow, OrderRow } from "../_lib/env.ts";
import { error, json, readJson } from "../_lib/http.ts";
import {
  mapOrder,
  portionLabel,
  validateLines,
  type OrderItemSnapshot,
  type OrderLocation,
} from "../_lib/orders.ts";

type Body = {
  lang?: string;
  lines?: unknown;
  name?: string;
  phone?: string;
  address?: string;
  landmark?: string;
  location?: Partial<OrderLocation> | null;
  message?: string;
};

function parseLocation(
  value: Body["location"],
): OrderLocation | null | { error: string } {
  if (value == null) return null;
  if (typeof value !== "object") return { error: "Invalid location" };
  const { lat, lng, accuracy } = value;
  if (
    typeof lat !== "number" ||
    !Number.isFinite(lat) ||
    lat < -90 ||
    lat > 90
  ) {
    return { error: "Invalid latitude" };
  }
  if (
    typeof lng !== "number" ||
    !Number.isFinite(lng) ||
    lng < -180 ||
    lng > 180
  ) {
    return { error: "Invalid longitude" };
  }
  const acc =
    typeof accuracy === "number" && Number.isFinite(accuracy) && accuracy > 0
      ? Math.min(accuracy, 50_000)
      : 0;
  return { lat, lng, accuracy: acc };
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const body = (await readJson<Body>(context.request)) ?? {};
  const lang = body.lang === "hi" ? "hi" : "en";
  const checked = validateLines(body.lines);
  if (!checked.ok) return error(checked.error);

  const locationResult = parseLocation(body.location);
  if (locationResult && "error" in locationResult) {
    return error(locationResult.error);
  }
  const location = locationResult;

  const sessionCustomer = await readCustomerSession(
    context.request,
    context.env,
  );

  let name = (body.name ?? "").trim().slice(0, 80);
  if (!name && sessionCustomer) name = sessionCustomer.name;

  let phone = "";
  const phoneRaw = (body.phone ?? "").trim();
  if (phoneRaw) {
    const normalized = normalizePhone(phoneRaw);
    if (!normalized) {
      return error("Enter a valid 10-digit Indian mobile number");
    }
    phone = normalized;
  } else if (sessionCustomer) {
    phone = sessionCustomer.phone;
  }

  const customerId = sessionCustomer?.id ?? null;
  const address = (body.address ?? "").trim().slice(0, 240);
  const landmark = (body.landmark ?? "").trim().slice(0, 160);
  const message = (body.message ?? "").trim().slice(0, 4000);

  const ids = [...new Set(checked.lines.map((line) => line.id))];
  const placeholders = ids.map(() => "?").join(", ");
  let menuRows: MenuRow[] = [];
  try {
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM menu_items WHERE id IN (${placeholders}) AND active = 1`,
    )
      .bind(...ids)
      .all<MenuRow>();
    menuRows = results ?? [];
  } catch (err) {
    console.error(err);
    return error("Failed to validate menu", 500);
  }

  const byId = new Map(menuRows.map((row) => [row.id, row]));
  const items: OrderItemSnapshot[] = [];
  let total = 0;

  for (const line of checked.lines) {
    const row = byId.get(line.id);
    if (!row) return error(`Unknown or inactive item: ${line.id}`);
    if (row.full == null && line.portion !== "single") {
      return error(`Item ${line.id} has no half/full portions`);
    }
    if (row.full != null && line.portion === "single") {
      return error(`Item ${line.id} requires half or full`);
    }
    const unitPrice =
      line.portion === "full" && row.full != null ? row.full : row.half;
    const lineTotal = unitPrice * line.qty;
    total += lineTotal;
    items.push({
      id: row.id,
      portion: line.portion,
      qty: line.qty,
      name: row.name,
      nameHi: row.name_hi,
      portionLabel: portionLabel(line.portion, row.unit, lang),
      unitPrice,
      lineTotal,
    });
  }

  const id = crypto.randomUUID();
  try {
    await context.env.DB.prepare(
      `INSERT INTO orders
        (id, status, lang, customer_name, address, landmark, lat, lng, accuracy, items_json, total, message, customer_id, phone, created_at, updated_at)
       VALUES (?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    )
      .bind(
        id,
        lang,
        name,
        address,
        landmark,
        location?.lat ?? null,
        location?.lng ?? null,
        location?.accuracy ?? null,
        JSON.stringify(items),
        total,
        message,
        customerId,
        phone,
      )
      .run();

    const row = await context.env.DB.prepare(
      `SELECT * FROM orders WHERE id = ?`,
    )
      .bind(id)
      .first<OrderRow>();

    if (!row) return error("Order created but not found", 500);
    return json({ order: mapOrder(row) }, { status: 201 });
  } catch (err) {
    console.error(err);
    return error("Failed to save order", 500);
  }
};
