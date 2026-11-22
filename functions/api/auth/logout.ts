import { clearSessionCookie } from "../../_lib/auth.ts";
import type { Env } from "../../_lib/env.ts";
import { json } from "../../_lib/http.ts";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const secure = new URL(context.request.url).protocol === "https:";
  return json({ ok: true }, { headers: { "set-cookie": clearSessionCookie(secure) } });
};
