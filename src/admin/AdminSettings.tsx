import { useEffect, useState, type FormEvent } from "react";
import type { ShopSettings } from "../data/site.ts";
import { fetchAdminSettings, updateSettings } from "../lib/api.ts";

export function AdminSettings() {
  const [form, setForm] = useState<ShopSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchAdminSettings()
      .then((result) => setForm(result.settings))
      .catch((err) =>
        setError(
          err instanceof Error ? err.message : "Failed to load settings",
        ),
      );
  }, []);

  async function onSave(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const result = await updateSettings(form);
      setForm(result.settings);
      setMessage("Settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }

  if (!form && !error) {
    return (
      <p className="text-sm font-semibold text-[#4e4036]">Loading settings…</p>
    );
  }

  if (!form) {
    return <p className="text-sm font-semibold text-maroon">{error}</p>;
  }

  return (
    <form onSubmit={onSave} className="grid max-w-3xl gap-4">
      <div>
        <h1 className="font-display text-4xl font-semibold text-ink">
          Shop settings
        </h1>
        <p className="mt-1 text-sm text-[#4e4036]">
          Phone, hours, free delivery, and delivery-app links.
        </p>
      </div>
      {error && (
        <p className="rounded-xl bg-maroon/10 px-3 py-2 text-sm font-semibold text-maroon">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl bg-veg/10 px-3 py-2 text-sm font-semibold text-veg">
          {message}
        </p>
      )}

      {(
        [
          ["name", "Shop name"],
          ["proprietor", "Proprietor"],
          ["phoneDisplay", "Phone display"],
          ["phoneTel", "Phone tel (+91…)"],
          ["whatsapp", "WhatsApp (digits only)"],
          ["hoursEn", "Hours (EN)"],
          ["hoursHi", "Hours (HI)"],
          ["opens", "Opens (HH:MM)"],
          ["closes", "Closes (HH:MM)"],
          ["zomato", "Zomato URL"],
          ["swiggy", "Swiggy URL"],
          ["magicpin", "Magicpin URL"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="grid gap-1 text-sm font-semibold">
          {label}
          <input
            value={String(form[key] ?? "")}
            onChange={(event) =>
              setForm({ ...form, [key]: event.target.value })
            }
            className="h-11 rounded-xl bg-white px-3 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
          />
        </label>
      ))}

      <label className="grid gap-1 text-sm font-semibold">
        Free delivery threshold (₹)
        <input
          type="number"
          min={0}
          value={form.freeDelivery}
          onChange={(event) =>
            setForm({ ...form, freeDelivery: Number(event.target.value) })
          }
          className="h-11 rounded-xl bg-white px-3 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold">
        Typical ready time (minutes)
        <input
          type="number"
          min={1}
          value={form.orderMinutes}
          onChange={(event) =>
            setForm({ ...form, orderMinutes: Number(event.target.value) })
          }
          className="h-11 rounded-xl bg-white px-3 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
        />
      </label>

      <button type="submit" className="btn btn-wa w-fit" disabled={busy}>
        {busy ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
