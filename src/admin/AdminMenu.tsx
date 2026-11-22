import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CATEGORIES, type CategoryId, type Unit } from "../data/menu.ts";
import {
  createMenuItem,
  deactivateMenuItem,
  fetchAdminMenu,
  updateMenuItem,
  type AdminMenuItem,
} from "../lib/api.ts";
import { inr } from "../lib/order.ts";

const UNITS: Unit[] = ["plate", "momo-12", "momo-6", "momo-5", "single"];

const emptyForm = {
  id: "",
  category: "chaap" as CategoryId,
  name: "",
  nameHi: "",
  desc: "",
  descHi: "",
  half: 100,
  full: "" as number | "",
  unit: "plate" as Unit,
  bestseller: false,
  active: true,
  sortOrder: 0,
};

export function AdminMenu() {
  const [items, setItems] = useState<AdminMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchAdminMenu();
      setItems(result.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.name} ${item.nameHi} ${item.category} ${item.id}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  function startCreate() {
    setEditingId("new");
    setForm({
      ...emptyForm,
      sortOrder: items.reduce((max, item) => Math.max(max, item.sortOrder ?? 0), -1) + 1,
    });
  }

  function startEdit(item: AdminMenuItem) {
    setEditingId(item.id);
    setForm({
      id: item.id,
      category: item.category,
      name: item.name,
      nameHi: item.nameHi,
      desc: item.desc,
      descHi: item.descHi,
      half: item.half,
      full: item.full ?? "",
      unit: item.unit,
      bestseller: Boolean(item.bestseller),
      active: item.active !== false,
      sortOrder: item.sortOrder ?? 0,
    });
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const payload = {
      category: form.category,
      name: form.name,
      nameHi: form.nameHi,
      desc: form.desc,
      descHi: form.descHi,
      half: Number(form.half),
      full: form.unit === "single" || form.full === "" ? null : Number(form.full),
      unit: form.unit,
      bestseller: form.bestseller,
      active: form.active,
      sortOrder: Number(form.sortOrder),
    };
    try {
      if (editingId === "new") {
        await createMenuItem({ ...payload, id: form.id || undefined });
      } else if (editingId) {
        await updateMenuItem(editingId, payload);
      }
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDeactivate(id: string) {
    if (!confirm("Hide this item from the public menu?")) return;
    setBusy(true);
    try {
      await deactivateMenuItem(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deactivate failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl font-semibold text-ink">Menu</h1>
          <p className="mt-1 text-sm text-[#4e4036]">Add, edit prices, or hide plates. Changes show on the public site after refresh.</p>
        </div>
        <button type="button" className="btn btn-call" onClick={startCreate}>
          Add item
        </button>
      </div>

      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search menu…"
        className="h-12 w-full max-w-md rounded-2xl bg-white px-4 text-base ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
      />

      {error && <p className="rounded-xl bg-maroon/10 px-3 py-2 text-sm font-semibold text-maroon">{error}</p>}
      {loading && <p className="text-sm font-semibold text-[#4e4036]">Loading…</p>}

      {editingId && (
        <form onSubmit={onSave} className="grid gap-3 rounded-[1.5rem] bg-white/90 p-4 ring-1 ring-ink/10 sm:grid-cols-2">
          <h2 className="font-display text-2xl font-semibold sm:col-span-2">
            {editingId === "new" ? "New item" : `Edit ${editingId}`}
          </h2>
          {editingId === "new" && (
            <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
              Id (optional slug)
              <input
                value={form.id}
                onChange={(event) => setForm((prev) => ({ ...prev, id: event.target.value }))}
                placeholder="auto from English name"
                className="h-11 rounded-xl px-3 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
              />
            </label>
          )}
          <label className="grid gap-1 text-sm font-semibold">
            Category
            <select
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as CategoryId }))}
              className="h-11 rounded-xl px-3 ring-1 ring-[#e4d5c0] outline-none"
            >
              {CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.en}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Unit
            <select
              value={form.unit}
              onChange={(event) => {
                const unit = event.target.value as Unit;
                setForm((prev) => ({
                  ...prev,
                  unit,
                  full: unit === "single" ? "" : prev.full,
                }));
              }}
              className="h-11 rounded-xl px-3 ring-1 ring-[#e4d5c0] outline-none"
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Name (EN)
            <input
              required
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="h-11 rounded-xl px-3 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Name (HI)
            <input
              required
              value={form.nameHi}
              onChange={(event) => setForm((prev) => ({ ...prev, nameHi: event.target.value }))}
              className="h-11 rounded-xl px-3 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
            Description (EN)
            <textarea
              required
              rows={2}
              value={form.desc}
              onChange={(event) => setForm((prev) => ({ ...prev, desc: event.target.value }))}
              className="rounded-xl px-3 py-2 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
            Description (HI)
            <textarea
              required
              rows={2}
              value={form.descHi}
              onChange={(event) => setForm((prev) => ({ ...prev, descHi: event.target.value }))}
              className="rounded-xl px-3 py-2 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Half / single ₹
            <input
              required
              type="number"
              min={1}
              value={form.half}
              onChange={(event) => setForm((prev) => ({ ...prev, half: Number(event.target.value) }))}
              className="h-11 rounded-xl px-3 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Full ₹
            <input
              type="number"
              min={1}
              disabled={form.unit === "single"}
              value={form.full}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  full: event.target.value === "" ? "" : Number(event.target.value),
                }))
              }
              className="h-11 rounded-xl px-3 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon disabled:opacity-50"
            />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Sort order
            <input
              type="number"
              value={form.sortOrder}
              onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))}
              className="h-11 rounded-xl px-3 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
            />
          </label>
          <div className="flex flex-wrap items-center gap-4 pt-6 text-sm font-semibold">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.bestseller}
                onChange={(event) => setForm((prev) => ({ ...prev, bestseller: event.target.checked }))}
              />
              Bestseller
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
              />
              Active on site
            </label>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className="btn btn-wa" disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button type="button" className="btn btn-zomato" onClick={() => setEditingId(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <ul className="divide-y divide-[#eadfce] rounded-[1.5rem] bg-white/80 ring-1 ring-ink/10">
        {filtered.map((item) => (
          <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold text-ink">
                {item.name}
                {!item.active && (
                  <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6e5b4c]">
                    Hidden
                  </span>
                )}
                {item.bestseller && (
                  <span className="ml-2 rounded-full bg-[#e36a12]/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#b45309]">
                    Bestseller
                  </span>
                )}
              </p>
              <p className="text-xs text-[#6e5b4c]">
                {item.category} · {item.id} · {inr(item.half)}
                {item.full != null ? ` / ${inr(item.full)}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="min-h-10 rounded-full px-3 text-sm font-semibold text-maroon" onClick={() => startEdit(item)}>
                Edit
              </button>
              {item.active && (
                <button
                  type="button"
                  className="min-h-10 rounded-full px-3 text-sm font-semibold text-[#6e5b4c]"
                  onClick={() => void onDeactivate(item.id)}
                  disabled={busy}
                >
                  Hide
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
