import { requireOwner } from "../../_lib/auth.ts";
import type { Env, OrderRow } from "../../_lib/env.ts";
import { error, json } from "../../_lib/http.ts";
import { isOrderStatus, mapOrder } from "../../_lib/orders.ts";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const session = await requireOwner(context.request, context.env);
  if (session instanceof Response) return session;

  const url = new URL(context.request.url);
  const status = url.searchParams.get("status");
  const limitRaw = Number(url.searchParams.get("limit") ?? "80");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 200)
    : 80;

  try {
    let rows: OrderRow[] = [];
    if (status && isOrderStatus(status)) {
      const { results } = await context.env.DB.prepare(
        `SELECT * FROM orders WHERE status = ? ORDER BY created_at DESC LIMIT ?`,
      )
        .bind(status, limit)
        .all<OrderRow>();
      rows = results ?? [];
    } else {
      const { results } = await context.env.DB.prepare(
        `SELECT * FROM orders ORDER BY created_at DESC LIMIT ?`,
      )
        .bind(limit)
        .all<OrderRow>();
      rows = results ?? [];
    }

    const newCountRow = await context.env.DB.prepare(
      `SELECT COUNT(*) AS count FROM orders WHERE status = 'new'`,
    ).first<{ count: number }>();

    return json({
      orders: rows.map(mapOrder),
      newCount: newCountRow?.count ?? 0,
    });
  } catch (err) {
    console.error(err);
    return error("Failed to load orders", 500);
  }
};
