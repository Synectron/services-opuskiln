import { requireOwner } from "../../_lib/auth.ts";
import type { Env, OrderRow } from "../../_lib/env.ts";
import { error, json } from "../../_lib/http.ts";
import { isOrderStatus, mapOrder } from "../../_lib/orders.ts";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Calendar date in Asia/Kolkata as YYYY-MM-DD. */
function todayIst(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const utc = new Date(Date.UTC(y, m - 1, d + delta));
  return utc.toISOString().slice(0, 10);
}

type DaySummaryRow = {
  day: string;
  order_count: number;
  revenue: number;
  new_count: number;
  accepted_count: number;
  done_count: number;
  cancelled_count: number;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const session = await requireOwner(context.request, context.env);
  if (session instanceof Response) return session;

  const url = new URL(context.request.url);
  const status = url.searchParams.get("status");
  const dayParam = url.searchParams.get("day");
  const day = dayParam && DAY_RE.test(dayParam) ? dayParam : todayIst();
  const limitRaw = Number(url.searchParams.get("limit") ?? "200");
  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 500)
    : 200;

  try {
    const daySql = `date(created_at, '+5 hours', '+30 minutes')`;

    let query = `SELECT * FROM orders WHERE ${daySql} = ?`;
    const binds: (string | number)[] = [day];
    if (status && isOrderStatus(status)) {
      query += ` AND status = ?`;
      binds.push(status);
    }
    query += ` ORDER BY created_at DESC LIMIT ?`;
    binds.push(limit);

    const { results } = await context.env.DB.prepare(query)
      .bind(...binds)
      .all<OrderRow>();
    const rows = results ?? [];

    const dayStats = await context.env.DB.prepare(
      `SELECT
         COUNT(*) AS order_count,
         COALESCE(SUM(total), 0) AS revenue,
         SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_count,
         SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS accepted_count,
         SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done_count,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count
       FROM orders
       WHERE ${daySql} = ?`,
    )
      .bind(day)
      .first<{
        order_count: number;
        revenue: number;
        new_count: number;
        accepted_count: number;
        done_count: number;
        cancelled_count: number;
      }>();

    const { results: dayRows } = await context.env.DB.prepare(
      `SELECT
         ${daySql} AS day,
         COUNT(*) AS order_count,
         COALESCE(SUM(total), 0) AS revenue,
         SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END) AS new_count,
         SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS accepted_count,
         SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done_count,
         SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count
       FROM orders
       GROUP BY ${daySql}
       ORDER BY day DESC
       LIMIT 45`,
    ).all<DaySummaryRow>();

    const newCountRow = await context.env.DB.prepare(
      `SELECT COUNT(*) AS count FROM orders WHERE status = 'new'`,
    ).first<{ count: number }>();

    const today = todayIst();
    const days = (dayRows ?? []).map((row) => ({
      day: row.day,
      orderCount: Number(row.order_count) || 0,
      revenue: Number(row.revenue) || 0,
      newCount: Number(row.new_count) || 0,
      acceptedCount: Number(row.accepted_count) || 0,
      doneCount: Number(row.done_count) || 0,
      cancelledCount: Number(row.cancelled_count) || 0,
      isToday: row.day === today,
    }));

    // Always include today in the strip even with zero orders.
    if (!days.some((entry) => entry.day === today)) {
      days.unshift({
        day: today,
        orderCount: 0,
        revenue: 0,
        newCount: 0,
        acceptedCount: 0,
        doneCount: 0,
        cancelledCount: 0,
        isToday: true,
      });
    }

    return json({
      day,
      today,
      prevDay: shiftDay(day, -1),
      nextDay: shiftDay(day, 1),
      isToday: day === today,
      stats: {
        orderCount: Number(dayStats?.order_count) || 0,
        revenue: Number(dayStats?.revenue) || 0,
        newCount: Number(dayStats?.new_count) || 0,
        acceptedCount: Number(dayStats?.accepted_count) || 0,
        doneCount: Number(dayStats?.done_count) || 0,
        cancelledCount: Number(dayStats?.cancelled_count) || 0,
      },
      days,
      orders: rows.map(mapOrder),
      newCount: newCountRow?.count ?? 0,
    });
  } catch (err) {
    console.error(err);
    return error("Failed to load orders", 500);
  }
};
