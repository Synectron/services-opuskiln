import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { customerLogin, customerRegister } from "../lib/api.ts";
import { useStore } from "../store.tsx";
import { useCustomerAuth } from "./CustomerAuth.tsx";

export function CustomerLogin() {
  const { t } = useStore();
  const { customer, setCustomer, loading } = useCustomerAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!loading && customer) {
    return <Navigate to="/account/orders" replace />;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result =
        mode === "register"
          ? await customerRegister({ phone, password, name })
          : await customerLogin(phone, password);
      setCustomer(result.customer);
      navigate("/account/orders", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.accountAuthFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <p className="text-xs font-semibold tracking-[0.2em] text-[#8a5a16] uppercase">
        {t.accountKicker}
      </p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-maroon">
        {mode === "login" ? t.accountLoginTitle : t.accountRegisterTitle}
      </h1>
      <p className="mt-2 text-sm text-[#4e4036]">{t.accountLead}</p>

      <div className="mt-6 flex gap-1 rounded-full bg-ink/5 p-1">
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
            mode === "login"
              ? "bg-white text-ink shadow-sm"
              : "text-[#6e5b4c]"
          }`}
          onClick={() => setMode("login")}
        >
          {t.accountLoginTab}
        </button>
        <button
          type="button"
          className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold ${
            mode === "register"
              ? "bg-white text-ink shadow-sm"
              : "text-[#6e5b4c]"
          }`}
          onClick={() => setMode("register")}
        >
          {t.accountRegisterTab}
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-4 grid gap-3 rounded-[1.5rem] bg-white/80 p-5 ring-1 ring-ink/10"
      >
        {mode === "register" && (
          <label className="grid gap-1 text-sm font-semibold">
            {t.name}
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t.namePh}
              className="h-12 rounded-xl bg-white px-3 text-base font-medium ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
              required
            />
          </label>
        )}
        <label className="grid gap-1 text-sm font-semibold">
          {t.phone}
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t.phonePh}
            className="h-12 rounded-xl bg-white px-3 text-base font-medium ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
            required
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          {t.accountPassword}
          <input
            type="password"
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t.accountPasswordPh}
            minLength={6}
            className="h-12 rounded-xl bg-white px-3 text-base font-medium ring-1 ring-[#e4d5c0] outline-none focus-visible:ring-2 focus-visible:ring-maroon"
            required
          />
        </label>
        {error && <p className="text-sm font-semibold text-maroon">{error}</p>}
        <button type="submit" className="btn btn-call mt-1" disabled={busy}>
          {busy
            ? t.accountWorking
            : mode === "login"
              ? t.accountSignIn
              : t.accountCreate}
        </button>
      </form>
      <Link to="/" className="mt-6 text-sm font-semibold text-maroon underline">
        {t.accountBack}
      </Link>
    </div>
  );
}
