import { requireCustomer } from "../../_lib/auth.ts";
import type { Env, OrderRow } from "../../_lib/env.ts";
import { error, json } from "../../_lib/http.ts";
import { mapOrder } from "../../_lib/orders.ts";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const customer = await requireCustomer(context.request, context.env);
  if (customer instanceof Response) return customer;

  const url = new URL(context.request.url);
  const limitRaw = Number(url.searchParams.get("limit") ?? "100");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 200)
    : 100;

  try {
    const { results } = await context.env.DB.prepare(
      `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT ?`,
    )
      .bind(customer.id, limit)
      .all<OrderRow>();

    return json({
      customer,
      orders: (results ?? []).map(mapOrder),
    });
  } catch (err) {
    console.error(err);
    return error("Failed to load orders", 500);
  }
};
