import { requireOwner } from "../../_lib/auth.ts";
import type { Env } from "../../_lib/env.ts";
import { json } from "../../_lib/http.ts";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const session = await requireOwner(context.request, context.env);
  if (session instanceof Response) return session;
  return json({ email: session.email, role: session.role });
};
