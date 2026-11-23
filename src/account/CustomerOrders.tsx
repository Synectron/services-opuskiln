import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchCustomerOrders, type OrderStatus, type ShopOrder } from "../lib/api.ts";
import { inr, mapsLink } from "../lib/order.ts";
import { useStore } from "../store.tsx";
import { useCustomerAuth } from "./CustomerAuth.tsx";

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  accepted: "Accepted",
  done: "Done",
  cancelled: "Cancelled",
};

function dayKey(iso: string): string {
  const date = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formatDay(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(Date.UTC(y, m - 1, d, 6, 30)));
}

function formatWhen(iso: string): string {
  const date = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function CustomerOrders() {
  const { t } = useStore();
  const { customer, logout } = useCustomerAuth();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchCustomerOrders()
      .then((result) => {
        if (!alive) return;
        setOrders(result.orders);
        setError(null);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : t.accountOrdersFailed);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [t.accountOrdersFailed]);

  const grouped = useMemo(() => {
    const map = new Map<string, ShopOrder[]>();
    for (const order of orders) {
      const key = dayKey(order.createdAt);
      const list = map.get(key) ?? [];
      list.push(order);
      map.set(key, list);
    }
    return [...map.entries()];
  }, [orders]);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#8a5a16] uppercase">
            {t.accountKicker}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-maroon">
            {t.accountOrdersTitle}
          </h1>
          <p className="mt-1 text-sm text-[#6e5b4c]">
            {customer?.name}
            {customer?.phone ? ` · +${customer.phone}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-ink ring-1 ring-ink/10"
          >
            {t.accountBack}
          </Link>
          <button
            type="button"
            className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-[#fffaf3]"
            onClick={() => void logout()}
          >
            {t.accountSignOut}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-5 rounded-xl bg-maroon/10 px-3 py-2 text-sm font-semibold text-maroon">
          {error}
        </p>
      )}

      {loading ? (
        <p className="mt-8 text-sm text-[#6e5b4c]">{t.accountOrdersLoading}</p>
      ) : orders.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white px-4 py-10 text-center ring-1 ring-ink/10">
          <p className="font-semibold text-ink">{t.accountOrdersEmpty}</p>
          <p className="mt-1 text-sm text-[#6e5b4c]">{t.accountOrdersEmptyBody}</p>
          <Link to="/#menu" className="btn btn-call mt-5 inline-flex">
            {t.browseMenu}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6">
          {grouped.map(([day, dayOrders]) => (
            <section key={day} className="grid gap-3">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {formatDay(day)}
              </h2>
              <ul className="grid gap-3">
                {dayOrders.map((order) => {
                  const open = expandedId === order.id;
                  return (
                    <li
                      key={order.id}
                      className={`rounded-2xl bg-white ring-1 ${
                        order.status === "new" || order.status === "accepted"
                          ? "ring-maroon/30"
                          : "ring-ink/10"
                      }`}
                    >
                      <button
                        type="button"
                        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
                        onClick={() =>
                          setExpandedId((current) =>
                            current === order.id ? null : order.id,
                          )
                        }
                        aria-expanded={open}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[#6e5b4c]">
                            {formatWhen(order.createdAt)} ·{" "}
                            {STATUS_LABEL[order.status]}
                          </p>
                          <p className="mt-1 font-display text-xl font-semibold">
                            {inr(order.total)} · {order.items.length}{" "}
                            {order.items.length === 1 ? "item" : "items"}
                          </p>
                        </div>
                        <span className="mt-1 shrink-0 text-sm font-semibold text-maroon">
                          {open ? t.close : t.accountOrderOpen}
                        </span>
                      </button>
                      {open && (
                        <div className="border-t border-[#eadfce] px-4 pb-4 pt-2">
                          <ul className="divide-y divide-[#eadfce] text-sm">
                            {order.items.map((item) => (
                              <li
                                key={`${item.id}-${item.portion}`}
                                className="flex justify-between gap-3 py-1.5"
                              >
                                <span>
                                  {order.lang === "hi" ? item.nameHi : item.name}{" "}
                                  ({item.portionLabel}) × {item.qty}
                                </span>
                                <span className="tabular-nums font-semibold">
                                  {inr(item.lineTotal)}
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-3 grid gap-1 text-sm text-[#6e5b4c]">
                            {order.address && (
                              <p>
                                {t.address}: {order.address}
                              </p>
                            )}
                            {order.landmark && (
                              <p>
                                {t.landmark}: {order.landmark}
                              </p>
                            )}
                            {order.location && (
                              <p>
                                <a
                                  className="font-semibold text-maroon underline"
                                  href={mapsLink(
                                    order.location.lat,
                                    order.location.lng,
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {t.locViewMap}
                                </a>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
