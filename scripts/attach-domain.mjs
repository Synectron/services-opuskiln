import { readFileSync } from "node:fs";
import { join } from "node:path";

const cfgPath = join(
  process.env.APPDATA,
  "xdg.config",
  ".wrangler",
  "config",
  "default.toml",
);
const cfg = readFileSync(cfgPath, "utf8");
const token = (cfg.match(/oauth_token\s*=\s*"([^"]+)"/) || [])[1];
if (!token) throw new Error("no oauth token");

const accountId = "0d7c9361a2629998ff616669f22be334";
const project = "rkn-punjabi-soya-chaap";
const host = "rkn-punjabi-soya-chaap.services.opuskiln.com";
const zoneName = "opuskiln.com";
const api = "https://api.cloudflare.com/client/v4";
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function cf(path, init) {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { ...headers, ...(init?.headers || {}) },
  });
  return response.json();
}

const zones = await cf(`/zones?name=${encodeURIComponent(zoneName)}`);
console.log("zone", {
  success: zones.success,
  count: zones.result?.length ?? 0,
  errors: zones.errors,
  id: zones.result?.[0]?.id,
  status: zones.result?.[0]?.status,
});

const proj = await cf(`/accounts/${accountId}/pages/projects/${project}`);
console.log("project", {
  success: proj.success,
  subdomain: proj.result?.subdomain,
  domains: proj.result?.domains,
  errors: proj.errors,
});

const attach = await cf(
  `/accounts/${accountId}/pages/projects/${project}/domains`,
  {
    method: "POST",
    body: JSON.stringify({ name: host }),
  },
);
console.log("attach", {
  success: attach.success,
  result: attach.result,
  errors: attach.errors,
});

const zoneId = zones.result?.[0]?.id;
const pagesHost = proj.result?.subdomain || `${project}.pages.dev`;
if (zoneId) {
  const existing = await cf(
    `/zones/${zoneId}/dns_records?type=CNAME&name=${encodeURIComponent(host)}`,
  );
  const recordId = existing.result?.[0]?.id;
  const body = {
    type: "CNAME",
    name: host,
    content: pagesHost,
    proxied: true,
    ttl: 1,
  };
  const dns = recordId
    ? await cf(`/zones/${zoneId}/dns_records/${recordId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      })
    : await cf(`/zones/${zoneId}/dns_records`, {
        method: "POST",
        body: JSON.stringify(body),
      });
  console.log("dns", {
    action: recordId ? "update" : "create",
    success: dns.success,
    result: dns.result && {
      id: dns.result.id,
      name: dns.result.name,
      content: dns.result.content,
      proxied: dns.result.proxied,
    },
    errors: dns.errors,
  });
} else {
  console.log(
    "dns_skipped",
    `Create CNAME ${host} -> ${pagesHost} at your DNS provider`,
  );
}

const status = await cf(
  `/accounts/${accountId}/pages/projects/${project}/domains/${host}`,
);
console.log("domain_status", {
  success: status.success,
  result: status.result,
  errors: status.errors,
});
