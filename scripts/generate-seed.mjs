import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const { MENU } = await import("../src/data/menu.ts");
const { SITE } = await import("../src/data/site.ts");

function esc(value) {
  return String(value).replaceAll("'", "''");
}

function jsonEsc(value) {
  return esc(JSON.stringify(value));
}

const rows = MENU.map((item, index) => {
  const full = item.full == null ? "NULL" : String(item.full);
  const bestseller = item.bestseller ? 1 : 0;
  return `INSERT INTO menu_items (id, category, name, name_hi, desc_en, desc_hi, half, full, unit, bestseller, active, sort_order) VALUES ('${esc(item.id)}', '${esc(item.category)}', '${esc(item.name)}', '${esc(item.nameHi)}', '${esc(item.desc)}', '${esc(item.descHi)}', ${item.half}, ${full}, '${esc(item.unit)}', ${bestseller}, 1, ${index});`;
});

const settings = `INSERT INTO shop_settings (
  id, name, proprietor, phone_display, phone_tel, whatsapp,
  address_lines, address_lines_hi, locality, region, postal_code, map_query,
  lat, lng, hours_en, hours_hi, opens, closes, order_minutes, free_delivery, zomato, swiggy
) VALUES (
  1,
  '${esc(SITE.name)}',
  '${esc(SITE.proprietor)}',
  '${esc(SITE.phoneDisplay)}',
  '${esc(SITE.phoneTel)}',
  '${esc(SITE.whatsapp)}',
  '${jsonEsc(SITE.addressLines)}',
  '${jsonEsc(SITE.addressLinesHi)}',
  '${esc(SITE.locality)}',
  '${esc(SITE.region)}',
  '${esc(SITE.postalCode)}',
  '${esc(SITE.mapQuery)}',
  ${SITE.lat},
  ${SITE.lng},
  '${esc(SITE.hoursEn)}',
  '${esc(SITE.hoursHi)}',
  '${esc(SITE.opens)}',
  '${esc(SITE.closes)}',
  ${SITE.orderMinutes},
  ${SITE.freeDelivery},
  '${esc(SITE.zomato)}',
  '${esc(SITE.swiggy)}'
);`;

const sql = `-- Seed generated from src/data/menu.ts and src/data/site.ts\n${rows.join("\n")}\n\n${settings}\n`;
const out = fileURLToPath(
  new URL("../migrations/0002_seed.sql", import.meta.url),
);
writeFileSync(out, sql);
console.log(`Wrote ${MENU.length} menu rows + shop_settings → ${out}`);
