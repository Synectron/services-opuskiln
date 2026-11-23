import type { OrderRow, OrderStatus } from "./env.ts";

export type OrderLinePayload = {
  id: string;
  portion: "half" | "full" | "single";
  qty: number;
};

export type OrderItemSnapshot = {
  id: string;
  portion: "half" | "full" | "single";
  qty: number;
  name: string;
  nameHi: string;
  portionLabel: string;
  unitPrice: number;
  lineTotal: number;
};

export type OrderLocation = {
  lat: number;
  lng: number;
  accuracy: number;
};

export type MappedOrder = {
  id: string;
  status: OrderStatus;
  lang: "en" | "hi";
  customerName: string;
  phone: string;
  customerId: string | null;
  address: string;
  landmark: string;
  location: OrderLocation | null;
  items: OrderItemSnapshot[];
  total: number;
  message: string;
  createdAt: string;
  updatedAt: string;
};

const STATUSES = new Set<OrderStatus>([
  "new",
  "accepted",
  "done",
  "cancelled",
]);

export function isOrderStatus(value: unknown): value is OrderStatus {
  return typeof value === "string" && STATUSES.has(value as OrderStatus);
}

export function mapOrder(row: OrderRow): MappedOrder {
  let items: OrderItemSnapshot[] = [];
  try {
    items = JSON.parse(row.items_json) as OrderItemSnapshot[];
    if (!Array.isArray(items)) items = [];
  } catch {
    items = [];
  }

  const hasCoords =
    typeof row.lat === "number" &&
    Number.isFinite(row.lat) &&
    typeof row.lng === "number" &&
    Number.isFinite(row.lng);

  return {
    id: row.id,
    status: row.status,
    lang: row.lang === "hi" ? "hi" : "en",
    customerName: row.customer_name,
    phone: row.phone || "",
    customerId: row.customer_id || null,
    address: row.address,
    landmark: row.landmark,
    location: hasCoords
      ? {
          lat: row.lat!,
          lng: row.lng!,
          accuracy:
            typeof row.accuracy === "number" && Number.isFinite(row.accuracy)
              ? row.accuracy
              : 0,
        }
      : null,
    items,
    total: row.total,
    message: row.message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function portionLabel(
  portion: "half" | "full" | "single",
  unit: string,
  lang: "en" | "hi",
): string {
  if (portion === "half") return lang === "hi" ? "हाफ" : "Half";
  if (portion === "full") return lang === "hi" ? "फुल" : "Full";
  if (unit.startsWith("momo")) {
    const pcs = unit.replace("momo-", "");
    return lang === "hi" ? `${pcs} पीस` : `${pcs} pc`;
  }
  return lang === "hi" ? "एक प्लेट" : "1 plate";
}

export function validateLines(
  lines: unknown,
): { ok: true; lines: OrderLinePayload[] } | { ok: false; error: string } {
  if (!Array.isArray(lines) || lines.length === 0) {
    return { ok: false, error: "Cart is empty" };
  }
  if (lines.length > 40) return { ok: false, error: "Too many line items" };

  const out: OrderLinePayload[] = [];
  for (const raw of lines) {
    if (!raw || typeof raw !== "object") {
      return { ok: false, error: "Invalid cart line" };
    }
    const line = raw as Partial<OrderLinePayload>;
    if (typeof line.id !== "string" || !line.id.trim()) {
      return { ok: false, error: "Invalid item id" };
    }
    if (
      line.portion !== "half" &&
      line.portion !== "full" &&
      line.portion !== "single"
    ) {
      return { ok: false, error: "Invalid portion" };
    }
    if (
      typeof line.qty !== "number" ||
      !Number.isInteger(line.qty) ||
      line.qty < 1 ||
      line.qty > 30
    ) {
      return { ok: false, error: "Invalid quantity" };
    }
    out.push({
      id: line.id.trim().slice(0, 64),
      portion: line.portion,
      qty: line.qty,
    });
  }
  return { ok: true, lines: out };
}
