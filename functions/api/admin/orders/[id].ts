import { requireOwner } from "../../../_lib/auth.ts";
import type { Env, OrderRow } from "../../../_lib/env.ts";
import { error, json, readJson } from "../../../_lib/http.ts";
import { isOrderStatus, mapOrder } from "../../../_lib/orders.ts";

type Body = {
  status?: string;
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const session = await requireOwner(context.request, context.env);
  if (session instanceof Response) return session;

  const idParam = context.params.id;
  if (!idParam || typeof idParam !== "string") return error("Missing order id");
  const id = decodeURIComponent(idParam).slice(0, 64);

  const body = (await readJson<Body>(context.request)) ?? {};
  if (!isOrderStatus(body.status)) return error("Invalid status");

  const existing = await context.env.DB.prepare(
    `SELECT id FROM orders WHERE id = ?`,
  )
    .bind(id)
    .first();
  if (!existing) return error("Order not found", 404);

  try {
    await context.env.DB.prepare(
      `UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`,
    )
      .bind(body.status, id)
      .run();

    const row = await context.env.DB.prepare(
      `SELECT * FROM orders WHERE id = ?`,
    )
      .bind(id)
      .first<OrderRow>();
    if (!row) return error("Order not found", 404);
    return json({ order: mapOrder(row) });
  } catch (err) {
    console.error(err);
    return error("Failed to update order", 500);
  }
};
