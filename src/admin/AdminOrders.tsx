import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  fetchAdminOrders,
  updateOrderStatus,
  type DaySummary,
  type OrderStatus,
  type ShopOrder,
} from "../lib/api.ts";
import { inr, mapsLink } from "../lib/order.ts";

const POLL_MS = 4000;
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

const STATUS_LABEL: Record<OrderStatus, string> = {
  new: "New",
  accepted: "Accepted",
  done: "Done",
  cancelled: "Cancelled",
};

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

function formatDayHeading(day: string, isToday: boolean): string {
  const [y, m, d] = day.split("-").map(Number);
  const label = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(y, m - 1, d, 6, 30)));
  return isToday ? `Today · ${label}` : label;
}

function formatDayChip(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
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

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 ring-1 ${
        accent
          ? "bg-maroon text-[#fffaf3] ring-maroon"
          : "bg-white text-ink ring-ink/10"
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          accent ? "text-[#fffaf3]/75" : "text-[#6e5b4c]"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 font-display text-2xl font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function OrderCard({
  order,
  expanded,
  busy,
  onToggle,
  onStatus,
}: {
  order: ShopOrder;
  expanded: boolean;
  busy: boolean;
  onToggle: () => void;
  onStatus: (status: OrderStatus) => void;
}) {
  return (
    <li
      className={`rounded-2xl bg-white ring-1 transition ${
        order.status === "new"
          ? "ring-2 ring-maroon/40"
          : "ring-ink/10 hover:ring-ink/20"
      }`}
    >
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6e5b4c]">
            {formatWhen(order.createdAt)} · {STATUS_LABEL[order.status]}
            {order.items.length > 0
              ? ` · ${order.items.reduce((n, item) => n + item.qty, 0)} items`
              : ""}
          </p>
          <p className="mt-1 truncate font-display text-xl font-semibold text-ink">
            {order.customerName || "Guest"} · {inr(order.total)}
          </p>
          {!expanded && order.address && (
            <p className="mt-1 truncate text-sm text-[#6e5b4c]">
              {order.address}
            </p>
          )}
        </div>
        <span className="mt-1 shrink-0 text-sm font-semibold text-maroon">
          {expanded ? "Hide" : "Open"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-[#eadfce] px-4 pb-4 pt-2">
          <div className="mb-3 flex flex-wrap gap-1">
            {order.status === "new" && (
              <button
                type="button"
                disabled={busy}
                className="rounded-full bg-veg px-3 py-2 text-sm font-semibold text-white"
                onClick={() => onStatus("accepted")}
              >
                Accept
              </button>
            )}
            {(order.status === "new" || order.status === "accepted") && (
              <button
                type="button"
                disabled={busy}
                className="rounded-full bg-ink px-3 py-2 text-sm font-semibold text-[#fffaf3]"
                onClick={() => onStatus("done")}
              >
                Done
              </button>
            )}
            {order.status !== "cancelled" && order.status !== "done" && (
              <button
                type="button"
                disabled={busy}
                className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-maroon ring-1 ring-maroon/30"
                onClick={() => onStatus("cancelled")}
              >
                Cancel
              </button>
            )}
            {(order.status === "done" || order.status === "cancelled") && (
              <button
                type="button"
                disabled={busy}
                className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-ink ring-1 ring-ink/10"
                onClick={() => onStatus("new")}
              >
                Reopen
              </button>
            )}
          </div>

          <ul className="divide-y divide-[#eadfce] text-sm">
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
                  onClick={(event) => event.stopPropagation()}
                >
                  Open map
                </a>
                {order.location.accuracy > 0
                  ? ` (±${Math.round(order.location.accuracy)} m)`
                  : ""}
              </p>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

export function AdminOrders() {
  const navigate = useNavigate();
  const { day: dayParam } = useParams();
  const selectedDay = dayParam && DAY_RE.test(dayParam) ? dayParam : todayIst();

  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [days, setDays] = useState<DaySummary[]>([]);
  const [stats, setStats] = useState({
    orderCount: 0,
    revenue: 0,
    newCount: 0,
    acceptedCount: 0,
    doneCount: 0,
    cancelledCount: 0,
  });
  const [today, setToday] = useState(todayIst());
  const [prevDay, setPrevDay] = useState(shiftDay(selectedDay, -1));
  const [nextDay, setNextDay] = useState(shiftDay(selectedDay, 1));
  const [isToday, setIsToday] = useState(selectedDay === todayIst());
  const [newCount, setNewCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "all" | OrderStatus>("open");
  const [soundOn, setSoundOn] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const knownIds = useRef<Set<string> | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const soundOnRef = useRef(soundOn);
  const selectedDayRef = useRef(selectedDay);
  soundOnRef.current = soundOn;
  selectedDayRef.current = selectedDay;

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try {
      const result = await fetchAdminOrders({
        day: selectedDayRef.current,
        limit: 300,
      });
      setOrders(result.orders);
      setDays(result.days);
      setStats(result.stats);
      setToday(result.today);
      setPrevDay(result.prevDay);
      setNextDay(result.nextDay);
      setIsToday(result.isToday);
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
        if (fresh.length > 0 && soundOnRef.current && result.isToday) {
          try {
            if (!audioRef.current) audioRef.current = new AudioContext();
            const ctx = audioRef.current;
            if (ctx.state === "suspended") await ctx.resume();
            playRing(ctx);
          } catch {
            // Autoplay may be blocked until a user gesture.
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
    knownIds.current = null;
    setExpandedId(null);
    void load();
    const timer = window.setInterval(() => void load(true), POLL_MS);
    return () => window.clearInterval(timer);
  }, [selectedDay]);

  useEffect(() => {
    return () => {
      void audioRef.current?.close();
    };
  }, []);

  async function setStatus(id: string, status: OrderStatus) {
    setBusyId(id);
    setError(null);
    try {
      await updateOrderStatus(id, status);
      if (status !== "new") knownIds.current?.delete(id);
      await load(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setBusyId(null);
    }
  }

  const visible = useMemo(() => {
    return orders.filter((order) => {
      if (filter === "all") return true;
      if (filter === "open")
        return order.status === "new" || order.status === "accepted";
      return order.status === filter;
    });
  }, [orders, filter]);

  const dayStrip = useMemo(() => {
    const map = new Map(days.map((entry) => [entry.day, entry]));
    // Fill a continuous recent window so empty days are still clickable.
    const end = today;
    const strip: DaySummary[] = [];
    for (let i = 0; i < 14; i += 1) {
      const day = shiftDay(end, -i);
      strip.push(
        map.get(day) ?? {
          day,
          orderCount: 0,
          revenue: 0,
          newCount: 0,
          acceptedCount: 0,
          doneCount: 0,
          cancelledCount: 0,
          isToday: day === today,
        },
      );
    }
    return strip;
  }, [days, today]);

  const canGoNext = nextDay <= today;

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-maroon">
            Kitchen dashboard
          </h1>
          <p className="mt-1 text-sm text-[#6e5b4c]">
            {formatDayHeading(selectedDay, isToday)}
            {newCount > 0 ? ` · ${newCount} new waiting overall` : ""}
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

      <div className="flex flex-wrap items-center gap-2">
        <Link
          to={`/admin/orders/${prevDay}`}
          className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-ink ring-1 ring-ink/10"
        >
          ← Prev
        </Link>
        {!isToday && (
          <Link
            to="/admin/orders"
            className="rounded-full bg-maroon px-3 py-2 text-sm font-semibold text-[#fffaf3]"
          >
            Today
          </Link>
        )}
        {canGoNext ? (
          <Link
            to={`/admin/orders/${nextDay}`}
            className="rounded-full bg-white px-3 py-2 text-sm font-semibold text-ink ring-1 ring-ink/10"
          >
            Next →
          </Link>
        ) : (
          <span className="rounded-full bg-ink/5 px-3 py-2 text-sm font-semibold text-ink/40">
            Next →
          </span>
        )}
        <label className="ml-auto flex items-center gap-2 text-sm font-semibold text-[#6e5b4c]">
          Jump to
          <input
            type="date"
            value={selectedDay}
            max={today}
            className="h-10 rounded-xl bg-white px-3 text-ink ring-1 ring-ink/10 outline-none focus-visible:ring-2 focus-visible:ring-maroon"
            onChange={(event) => {
              const value = event.target.value;
              if (!DAY_RE.test(value)) return;
              navigate(
                value === today ? "/admin/orders" : `/admin/orders/${value}`,
              );
            }}
          />
        </label>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {dayStrip.map((entry) => {
          const active = entry.day === selectedDay;
          return (
            <Link
              key={entry.day}
              to={
                entry.day === today
                  ? "/admin/orders"
                  : `/admin/orders/${entry.day}`
              }
              className={`min-w-[6.5rem] shrink-0 rounded-2xl px-3 py-3 ring-1 transition ${
                active
                  ? "bg-maroon text-[#fffaf3] ring-maroon"
                  : "bg-white text-ink ring-ink/10 hover:ring-ink/25"
              }`}
            >
              <p
                className={`text-xs font-semibold ${
                  active ? "text-[#fffaf3]/8" : "text-[#6e5b4c]"
                }`}
              >
                {entry.isToday ? "Today" : formatDayChip(entry.day)}
              </p>
              <p className="mt-1 font-display text-xl font-semibold tabular-nums">
                {entry.orderCount}
              </p>
              <p
                className={`text-xs tabular-nums ${
                  active ? "text-[#fffaf3]/75" : "text-[#6e5b4c]"
                }`}
              >
                {inr(entry.revenue)}
                {entry.newCount > 0 ? ` · ${entry.newCount} new` : ""}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <StatCard label="Orders" value={String(stats.orderCount)} />
        <StatCard label="Revenue" value={inr(stats.revenue)} accent />
        <StatCard
          label="Open"
          value={String(stats.newCount + stats.acceptedCount)}
        />
        <StatCard label="Done" value={String(stats.doneCount)} />
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
            {key === "new" && stats.newCount > 0 ? ` (${stats.newCount})` : ""}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-maroon/10 px-3 py-2 text-sm font-semibold text-maroon">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-[#6e5b4c]">Loading day’s orders…</p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl bg-white px-4 py-8 text-center text-sm text-[#6e5b4c] ring-1 ring-ink/10">
          No orders for this day
          {filter !== "all" ? " in this filter" : ""}. Try another day from the
          strip above.
        </p>
      ) : (
        <ul className="grid gap-3">
          {visible.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              expanded={expandedId === order.id}
              busy={busyId === order.id}
              onToggle={() =>
                setExpandedId((current) =>
                  current === order.id ? null : order.id,
                )
              }
              onStatus={(status) => void setStatus(order.id, status)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
