import { useEffect, useRef, useState } from "react";
import {
  fetchAdminOrders,
  updateOrderStatus,
  type OrderStatus,
  type ShopOrder,
} from "../lib/api.ts";
import { inr, mapsLink } from "../lib/order.ts";

const POLL_MS = 4000;

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  accepted: "Accepted",
  done: "Done",
  cancelled: "Cancelled",
};

function formatWhen(iso: string): string {
  const date = new Date(iso.includes("T") ? iso : `${iso.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

function playRing(audioCtx: AudioContext) {
  const now = audioCtx.currentTime;
  for (let i = 0; i < 3; i += 1) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = i % 2 === 0 ? 880 : 1175;
    gain.gain.setValueAtTime(0.0001, now + i * 0.28);
    gain.gain.exponentialRampToValueAtTime(0.22, now + i * 0.28 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.28 + 0.22);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now + i * 0.28);
    osc.stop(now + i * 0.28 + 0.24);
  }
}

export function AdminOrders() {
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "all" | OrderStatus>("open");
  const [soundOn, setSoundOn] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const knownIds = useRef<Set<string> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const result = await fetchAdminOrders({ limit: 100 });
      setOrders(result.orders);
      setNewCount(result.newCount);
      setError(null);

      const incoming = result.orders.filter((order) => order.status === "new");
      if (knownIds.current == null) {
        knownIds.current = new Set(incoming.map((order) => order.id));
      } else {
        const fresh = incoming.filter(
          (order) => !knownIds.current!.has(order.id),
        );
        for (const order of incoming) knownIds.current.add(order.id);
        if (fresh.length > 0 && soundOnRef.current) {
          try {
            if (!audioRef.current) {
              audioRef.current = new AudioContext();
            }
            const ctx = audioRef.current;
            if (ctx.state === "suspended") await ctx.resume();
            playRing(ctx);
          } catch {
            // Autoplay / AudioContext may be blocked until a click.
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(true), POLL_MS);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    return () => {
      void audioRef.current?.close();
    };
  }, []);

  async function setStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    setError(null);
    try {
      const result = await updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((order) => (order.id === id ? result.order : order)),
      );
      if (status !== "new") knownIds.current?.delete(id);
      const latest = await fetchAdminOrders({ limit: 100 });
      setOrders(latest.orders);
      setNewCount(latest.newCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setBusyId(null);
    }
  }

  const visible = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "open")
      return order.status === "new" || order.status === "accepted";
    return order.status === filter;
  });

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-maroon">
            Orders
          </h1>
          <p className="mt-1 text-sm text-[#6e5b4c]">
            Live kitchen board — refreshes every few seconds.
            {newCount > 0 ? ` ${newCount} new waiting.` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`rounded-full px-3 py-2 text-sm font-semibold ${
              soundOn
                ? "bg-maroon text-[#fffaf3]"
                : "bg-white text-ink ring-1 ring-ink/10"
            }`}
            onClick={() => {
              setSoundOn((value) => !value);
              if (!audioRef.current) audioRef.current = new AudioContext();
              void audioRef.current.resume();
            }}
          >
            {soundOn ? "Sound on" : "Sound off"}
          </button>
          <button
            type="button"
            className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-[#fffaf3]"
            onClick={() => void load()}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {(
          [
            ["open", "Open"],
            ["new", "New"],
            ["accepted", "Accepted"],
            ["done", "Done"],
            ["cancelled", "Cancelled"],
            ["all", "All"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-3 py-2 text-sm font-semibold ${
              filter === key
                ? "bg-maroon text-[#fffaf3]"
                : "bg-white text-ink/80 ring-1 ring-ink/10"
            }`}
          >
            {label}
            {key === "new" && newCount > 0 ? ` (${newCount})` : ""}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-maroon/10 px-3 py-2 text-sm font-semibold text-maroon">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[#6e5b4c]">Loading orders…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-[#6e5b4c] ring-1 ring-ink/10">
          No orders in this view yet. New WhatsApp orders from the site will
          show up here.
        </p>
      ) : (
        <ul className="grid gap-3">
          {visible.map((order) => (
            <li
              key={order.id}
              className={`rounded-2xl bg-white p-4 ring-1 ring-ink/10 ${
                order.status === "new" ? "ring-2 ring-maroon/40" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#6e5b4c]">
                    {formatWhen(order.createdAt)} · {STATUS_LABEL[order.status]}
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold text-ink">
                    {order.customerName || "Guest"} · {inr(order.total)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {order.status === "new" && (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      className="rounded-full bg-veg px-3 py-2 text-sm font-semibold text-white"
                      onClick={() => void setStatus(order.id, "accepted")}
                    >
                      Accept
                    </button>
                  )}
                  {(order.status === "new" || order.status === "accepted") && (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-[#fffaf3]"
                      onClick={() => void setStatus(order.id, "done")}
                    >
                      Done
                    </button>
                  )}
                  {order.status !== "cancelled" && order.status !== "done" && (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-maroon ring-1 ring-maroon/30"
                      onClick={() => void setStatus(order.id, "cancelled")}
                    >
                      Cancel
                    </button>
                  )}
                  {(order.status === "done" ||
                    order.status === "cancelled") && (
                    <button
                      type="button"
                      disabled={busyId === order.id}
                      className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-ink ring-1 ring-ink/10"
                      onClick={() => void setStatus(order.id, "new")}
                    >
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              <ul className="mt-3 divide-y divide-[#eadfce] text-sm">
                {order.items.map((item) => (
                  <li
                    key={`${item.id}-${item.portion}`}
                    className="flex items-start justify-between gap-3 py-1.5"
                  >
                    <span>
                      {order.lang === "hi" ? item.nameHi : item.name} (
                      {item.portionLabel}) × {item.qty}
                    </span>
                    <span className="shrink-0 tabular-nums font-semibold">
                      {inr(item.lineTotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 grid gap-1 text-sm text-[#6e5b4c]">
                {order.address && <p>Address: {order.address}</p>}
                {order.landmark && <p>Landmark: {order.landmark}</p>}
                {order.location && (
                  <p>
                    Location:{" "}
                    <a
                      className="font-semibold text-maroon underline"
                      href={mapsLink(order.location.lat, order.location.lng)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open map
                    </a>
                    {order.location.accuracy > 0
                      ? ` (±${Math.round(order.location.accuracy)} m)`
                      : ""}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
