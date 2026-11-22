import {
  findAdmin,
  listAdmins,
  mapAdmin,
  normalizeEmail,
  upsertAdmin,
  type AdminRole,
} from "../../_lib/admins.ts";
import { requireSuperAdmin } from "../../_lib/auth.ts";
import type { Env } from "../../_lib/env.ts";
import { error, json, readJson } from "../../_lib/http.ts";
import { hashPassword } from "../../_lib/password.ts";

type Body = {
  email?: string;
  password?: string;
  role?: AdminRole;
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const session = await requireSuperAdmin(context.request, context.env);
  if (session instanceof Response) return session;
  try {
    const rows = await listAdmins(context.env.DB);
    return json({ admins: rows.map(mapAdmin) });
  } catch (err) {
    console.error(err);
    return error("Failed to list admins", 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const session = await requireSuperAdmin(context.request, context.env);
  if (session instanceof Response) return session;

  const body = (await readJson<Body>(context.request)) ?? {};
  const email = normalizeEmail(body.email ?? "");
  const password = body.password ?? "";
  const role: AdminRole = body.role === "super_admin" ? "super_admin" : "admin";

  if (!email || !email.includes("@")) return error("Valid email is required");
  if (password.length < 8)
    return error("Password must be at least 8 characters");

  const existing = await findAdmin(context.env.DB, email);
  if (existing) return error("An admin with this email already exists", 409);

  try {
    const passwordHash = await hashPassword(password);
    const row = await upsertAdmin(context.env.DB, {
      email,
      role,
      passwordHash,
      createdBy: session.email,
    });
    return json({ admin: mapAdmin(row) }, { status: 201 });
  } catch (err) {
    console.error(err);
    return error("Failed to create admin", 500);
  }
};
