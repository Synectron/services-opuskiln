import { authenticateAdmin } from "../../_lib/admins.ts";
import { createSessionToken, sessionCookie } from "../../_lib/auth.ts";
import type { Env } from "../../_lib/env.ts";
import { error, json, readJson } from "../../_lib/http.ts";

type Body = { email?: string; password?: string };

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  if (!env.SESSION_SECRET) {
    return error("Owner auth is not configured. Set SESSION_SECRET.", 503);
  }

  const body = await readJson<Body>(request);
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";
  if (!email || !password) return error("Email and password are required");

  const admin = await authenticateAdmin(env, email, password);
  if (!admin) return error("Invalid email or password", 401);

  const token = await createSessionToken(admin.email, env.SESSION_SECRET);
  const secure = new URL(request.url).protocol === "https:";
  return json(
    { ok: true, email: admin.email, role: admin.role },
    { headers: { "set-cookie": sessionCookie(token, secure) } },
  );
};
