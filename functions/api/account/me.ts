import { requireCustomer } from "../../_lib/auth.ts";
import type { Env } from "../../_lib/env.ts";
import { json } from "../../_lib/http.ts";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const customer = await requireCustomer(context.request, context.env);
  if (customer instanceof Response) return customer;
  return json({ customer });
};
