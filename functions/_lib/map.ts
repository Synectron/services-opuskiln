import type { MenuRow, SettingsRow } from "./env.ts";

export { mapOrder } from "./orders.ts";

export function mapMenuItem(row: MenuRow) {
  return {
    id: row.id,
    category: row.category,
    name: row.name,
    nameHi: row.name_hi,
    desc: row.desc_en,
    descHi: row.desc_hi,
    half: row.half,
    full: row.full,
    unit: row.unit,
    bestseller: row.bestseller === 1,
    active: row.active === 1,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at,
  };
}

export function mapSettings(row: SettingsRow) {
  return {
    name: row.name,
    proprietor: row.proprietor,
    phoneDisplay: row.phone_display,
    phoneTel: row.phone_tel,
    whatsapp: row.whatsapp,
    addressLines: JSON.parse(row.address_lines) as string[],
    addressLinesHi: JSON.parse(row.address_lines_hi) as string[],
    locality: row.locality,
    region: row.region,
    postalCode: row.postal_code,
    mapQuery: row.map_query,
    lat: row.lat,
    lng: row.lng,
    hoursEn: row.hours_en,
    hoursHi: row.hours_hi,
    opens: row.opens,
    closes: row.closes,
    orderMinutes: row.order_minutes,
    freeDelivery: row.free_delivery,
    zomato: row.zomato,
    swiggy: row.swiggy,
    magicpin: row.magicpin || "",
    updatedAt: row.updated_at,
  };
}
