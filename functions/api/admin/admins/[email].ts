import {
  countActiveSuperAdmins,
  findAdmin,
  mapAdmin,
  normalizeEmail,
  type AdminRole,
} from "../../../_lib/admins.ts";
import { requireSuperAdmin } from "../../../_lib/auth.ts";
import type { Env } from "../../../_lib/env.ts";
import { error, json, readJson } from "../../../_lib/http.ts";
import { hashPassword } from "../../../_lib/password.ts";

type Body = {
  role?: AdminRole;
  active?: boolean;
  password?: string;
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
  const session = await requireSuperAdmin(context.request, context.env);
  if (session instanceof Response) return session;

  const emailParam = context.params.email;
  if (!emailParam || typeof emailParam !== "string")
    return error("Missing email");
  const email = normalizeEmail(decodeURIComponent(emailParam));

  const current = await findAdmin(context.env.DB, email);
  if (!current) return error("Admin not found", 404);

  const body = (await readJson<Body>(context.request)) ?? {};
  const role: AdminRole =
    body.role === "super_admin" || body.role === "admin"
      ? body.role
      : current.role;
  const active = body.active === undefined ? current.active === 1 : body.active;

  if (current.role === "super_admin" && (role !== "super_admin" || !active)) {
    const supers = await countActiveSuperAdmins(context.env.DB);
    if (supers <= 1)
      return error("Cannot remove or demote the last super admin");
  }

  if (email === session.email && !active) {
    return error("You cannot deactivate your own account");
  }

  let passwordHash = current.password_hash;
  if (body.password != null && body.password !== "") {
    if (body.password.length < 8)
      return error("Password must be at least 8 characters");
    passwordHash = await hashPassword(body.password);
  }

  try {
    await context.env.DB.prepare(
      `UPDATE admins SET role = ?, active = ?, password_hash = ?, updated_at = datetime('now') WHERE email = ?`,
    )
      .bind(role, active ? 1 : 0, passwordHash, email)
      .run();
    const row = await findAdmin(context.env.DB, email);
    return json({ admin: mapAdmin(row!) });
  } catch (err) {
    console.error(err);
    return error("Failed to update admin", 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const session = await requireSuperAdmin(context.request, context.env);
  if (session instanceof Response) return session;

  const emailParam = context.params.email;
  if (!emailParam || typeof emailParam !== "string")
    return error("Missing email");
  const email = normalizeEmail(decodeURIComponent(emailParam));

  if (email === session.email)
    return error("You cannot delete your own account");

  const current = await findAdmin(context.env.DB, email);
  if (!current) return error("Admin not found", 404);

  if (current.role === "super_admin" && current.active === 1) {
    const supers = await countActiveSuperAdmins(context.env.DB);
    if (supers <= 1) return error("Cannot delete the last super admin");
  }

  try {
    // Soft-delete
    await context.env.DB.prepare(
      `UPDATE admins SET active = 0, updated_at = datetime('now') WHERE email = ?`,
    )
      .bind(email)
      .run();
    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return error("Failed to deactivate admin", 500);
  }
};
