import {
  createCustomerSessionToken,
  customerSessionCookie,
} from "../../_lib/auth.ts";
import { authenticateCustomer } from "../../_lib/customers.ts";
import type { Env } from "../../_lib/env.ts";
import { error, json, readJson } from "../../_lib/http.ts";

type Body = { phone?: string; password?: string };

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  if (!env.SESSION_SECRET) {
    return error("Customer auth is not configured. Set SESSION_SECRET.", 503);
  }

  const body = (await readJson<Body>(request)) ?? {};
  const phone = body.phone?.trim() ?? "";
  const password = body.password ?? "";
  if (!phone || !password) return error("Phone and password are required");

  const customer = await authenticateCustomer(env, phone, password);
  if (!customer) return error("Invalid phone or password", 401);

  const token = await createCustomerSessionToken(
    customer.id,
    env.SESSION_SECRET,
  );
  const secure = new URL(request.url).protocol === "https:";
  return json(
    { ok: true, customer },
    { headers: { "set-cookie": customerSessionCookie(token, secure) } },
  );
};
