import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { login } from "../lib/api.ts";
import { useAdminAuth } from "./AdminAuth.tsx";

export function AdminLogin() {
  const { user, setUser, loading } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("shubhammishrax@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/admin" replace />;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await login(email, password);
      setUser({ email: result.email, role: result.role || "super_admin" });
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-[#8a5a16] uppercase">
        Super admin
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-maroon">
        RKN admin
      </h1>
      <p className="mt-2 text-sm text-[#4e4036]">
        Sign in to edit the menu and shop settings.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 grid gap-3 rounded-[1.5rem] bg-white/80 p-5 ring-1 ring-ink/10"
      >
        <label className="grid gap-1 text-sm font-semibold">
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-12 rounded-xl bg-white px-3 text-base font-medium ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
            required
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 rounded-xl bg-white px-3 text-base font-medium ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
            required
          />
        </label>
        {error && <p className="text-sm font-semibold text-maroon">{error}</p>}
        <button type="submit" className="btn btn-call mt-1" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <Link to="/" className="mt-6 text-sm font-semibold text-maroon underline">
        Back to site
      </Link>
    </div>
  );
}
