import { useEffect, useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import {
  createAdmin,
  deactivateAdmin,
  fetchAdmins,
  updateAdmin,
  type AdminAccount,
  type AdminRole,
} from "../lib/api.ts";
import { useAdminAuth } from "./AdminAuth.tsx";

export function AdminAdmins() {
  const { user } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("admin");

  async function load() {
    setError(null);
    try {
      const result = await fetchAdmins();
      setAdmins(result.admins);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load admins");
    }
  }

  useEffect(() => {
    if (user?.role === "super_admin") void load();
  }, [user?.role]);

  if (user && user.role !== "super_admin") {
    return <Navigate to="/admin" replace />;
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await createAdmin({ email, password, role });
      setEmail("");
      setPassword("");
      setRole("admin");
      setMessage("Admin added.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add admin");
    } finally {
      setBusy(false);
    }
  }

  async function onResetPassword(admin: AdminAccount) {
    const next = prompt(`New password for ${admin.email} (min 8 characters)`);
    if (!next) return;
    setBusy(true);
    setError(null);
    try {
      await updateAdmin(admin.email, { password: next });
      setMessage(`Password updated for ${admin.email}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Password update failed");
    } finally {
      setBusy(false);
    }
  }

  async function onToggleRole(admin: AdminAccount) {
    const nextRole: AdminRole =
      admin.role === "super_admin" ? "admin" : "super_admin";
    if (!confirm(`Change ${admin.email} to ${nextRole.replaceAll("_", " ")}?`))
      return;
    setBusy(true);
    setError(null);
    try {
      await updateAdmin(admin.email, { role: nextRole });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Role update failed");
    } finally {
      setBusy(false);
    }
  }

  async function onDeactivate(admin: AdminAccount) {
    if (
      !confirm(
        `Deactivate ${admin.email}? They will no longer be able to sign in.`,
      )
    )
      return;
    setBusy(true);
    setError(null);
    try {
      await deactivateAdmin(admin.email);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deactivate failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid max-w-3xl gap-5">
      <div>
        <h1 className="font-display text-4xl font-semibold text-ink">Admins</h1>
        <p className="mt-1 text-sm text-[#4e4036]">
          Super admins can add staff logins. Regular admins can edit menu and
          settings only.
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

      <form
        onSubmit={onCreate}
        className="grid gap-3 rounded-[1.5rem] bg-white/90 p-4 ring-1 ring-ink/10 sm:grid-cols-2"
      >
        <h2 className="font-display text-2xl font-semibold sm:col-span-2">
          Add admin
        </h2>
        <label className="grid gap-1 text-sm font-semibold sm:col-span-2">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 rounded-xl px-3 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Temporary password
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-11 rounded-xl px-3 ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Role
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as AdminRole)}
            className="h-11 rounded-xl px-3 ring-1 ring-[#e4d5c0] outline-none"
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super admin</option>
          </select>
        </label>
        <button
          type="submit"
          className="btn btn-wa w-fit sm:col-span-2"
          disabled={busy}
        >
          {busy ? "Saving…" : "Add admin"}
        </button>
      </form>

      <ul className="divide-y divide-[#eadfce] rounded-[1.5rem] bg-white/80 ring-1 ring-ink/10">
        {admins.map((admin) => (
          <li
            key={admin.email}
            className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
          >
            <div>
              <p className="font-semibold text-ink">
                {admin.email}
                {!admin.active && (
                  <span className="ml-2 rounded-full bg-ink/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#6e5b4c]">
                    Inactive
                  </span>
                )}
              </p>
              <p className="text-xs text-[#6e5b4c]">
                {admin.role.replaceAll("_", " ")}
                {admin.createdBy ? ` · added by ${admin.createdBy}` : ""}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="min-h-10 rounded-full px-3 text-sm font-semibold text-maroon"
                disabled={busy}
                onClick={() => void onResetPassword(admin)}
              >
                Reset password
              </button>
              <button
                type="button"
                className="min-h-10 rounded-full px-3 text-sm font-semibold text-ink/80"
                disabled={busy || admin.email === user?.email}
                onClick={() => void onToggleRole(admin)}
              >
                {admin.role === "super_admin"
                  ? "Make admin"
                  : "Make super admin"}
              </button>
              {admin.active && admin.email !== user?.email && (
                <button
                  type="button"
                  className="min-h-10 rounded-full px-3 text-sm font-semibold text-[#6e5b4c]"
                  disabled={busy}
                  onClick={() => void onDeactivate(admin)}
                >
                  Deactivate
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
