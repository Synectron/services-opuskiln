import {
  createCustomerSessionToken,
  customerSessionCookie,
} from "../../_lib/auth.ts";
import { registerCustomer } from "../../_lib/customers.ts";
import type { Env } from "../../_lib/env.ts";
import { error, json, readJson } from "../../_lib/http.ts";

type Body = { phone?: string; password?: string; name?: string };

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { env, request } = context;
  if (!env.SESSION_SECRET) {
    return error("Customer auth is not configured. Set SESSION_SECRET.", 503);
  }

  const body = (await readJson<Body>(request)) ?? {};
  const result = await registerCustomer(env, {
    phone: body.phone ?? "",
    password: body.password ?? "",
    name: body.name ?? "",
  });
  if (!result.ok) return error(result.error, result.status ?? 400);

  const token = await createCustomerSessionToken(
    result.customer.id,
    env.SESSION_SECRET,
  );
  const secure = new URL(request.url).protocol === "https:";
  return json(
    { ok: true, customer: result.customer },
    {
      status: 201,
      headers: { "set-cookie": customerSessionCookie(token, secure) },
    },
  );
};
