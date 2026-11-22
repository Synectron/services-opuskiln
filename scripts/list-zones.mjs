import { readFileSync } from "node:fs";
import { join } from "node:path";

const cfg = readFileSync(
  join(
    process.env.APPDATA,
    "xdg.config",
    ".wrangler",
    "config",
    "default.toml",
  ),
  "utf8",
);
const token = (cfg.match(/oauth_token\s*=\s*"([^"]+)"/) || [])[1];
const headers = { Authorization: `Bearer ${token}` };
const z = await fetch(
  "https://api.cloudflare.com/client/v4/zones?per_page=50",
  { headers },
).then((r) => r.json());
console.log(
  "zones",
  (z.result || []).map((x) => ({ name: x.name, id: x.id, status: x.status })),
);
console.log("errors", z.errors);
