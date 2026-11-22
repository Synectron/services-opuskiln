import {
  activePortion,
  itemName,
  portionName,
  unitPrice,
  type CartPortion,
  type Lang,
  type MenuItem,
  type SizeChoice,
} from "../data/menu.ts";
import { findItem, findItemSafe, getSite } from "../data/runtime.ts";
import { DEFAULT_SITE } from "../data/site.ts";

export type CartLine = {
  id: string;
  portion: CartPortion;
  qty: number;
};

export type SharedLocation = {
  lat: number;
  lng: number;
  accuracy: number;
};

export function formatCoord(value: number): string {
  return value.toFixed(6);
}

export function accuracyMeters(accuracy: number): number {
  if (!Number.isFinite(accuracy) || accuracy <= 0) return 1;
  return Math.max(1, Math.round(accuracy));
}

export function mapsLink(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${formatCoord(lat)},${formatCoord(lng)}`;
}

export function mapsEmbedSrc(lat: number, lng: number): string {
  return `https://maps.google.com/maps?q=${formatCoord(lat)},${formatCoord(lng)}&z=17&output=embed`;
}

export function inr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function lineCost(line: CartLine, item?: MenuItem): number {
  return unitPrice(item ?? findItem(line.id), line.portion) * line.qty;
}

export function orderTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + lineCost(line), 0);
}

export function orderCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function deliveryGap(
  total: number,
  threshold = getSite().freeDelivery,
): number {
  return Math.max(0, threshold - total);
}

export function portionForAdd(id: string, size: SizeChoice): CartPortion {
  return activePortion(findItem(id), size);
}

/** Order timestamp in Asia/Kolkata for WhatsApp messages. */
export function formatOrderStamp(
  when: Date = new Date(),
  lang: Lang = "en",
): string {
  const date = new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(when);
  const time = new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(when);
  return lang === "hi"
    ? `तारीख: ${date} · समय: ${time} IST`
    : `Date: ${date} · Time: ${time} IST`;
}

export function buildWhatsAppText(input: {
  lang: Lang;
  lines: CartLine[];
  name: string;
  address: string;
  landmark?: string;
  location?: SharedLocation | null;
  orderedAt?: Date;
}): string {
  const hi = input.lang === "hi";
  const threshold = getSite().freeDelivery;
  const stamp = formatOrderStamp(input.orderedAt ?? new Date(), input.lang);
  const rows = input.lines.map((line, index) => {
    const item = findItem(line.id);
    const title = itemName(item, input.lang);
    const portion = portionName(item, line.portion, input.lang);
    return `${index + 1}. ${title} (${portion}) × ${line.qty} — ${inr(lineCost(line, item))}`;
  });
  const total = orderTotal(input.lines);
  const gap = deliveryGap(total, threshold);
  const delivery =
    gap === 0
      ? hi
        ? `फ्री होम डिलीवरी (₹${threshold} या उससे ऊपर का ऑर्डर)।`
        : `Free home delivery (order of ₹${threshold} or more).`
      : hi
        ? `फ्री होम डिलीवरी ₹${threshold} के ऑर्डर पर। इस ऑर्डर में ₹${gap} और जोड़ें।`
        : `Free home delivery is on orders of ₹${threshold}+. This order is ₹${gap} short.`;
  const who = input.name.trim().slice(0, 80) || "—";
  const where = input.address.trim().slice(0, 240) || "—";
  const landmark = input.landmark?.trim().slice(0, 160) ?? "";
  const location = input.location;
  const placeLines = [
    hi ? `नाम: ${who}` : `Name: ${who}`,
    hi ? `पता: ${where}` : `Address: ${where}`,
  ];
  if (landmark)
    placeLines.push(hi ? `लैंडमार्क: ${landmark}` : `Landmark: ${landmark}`);
  if (location) {
    const meters = accuracyMeters(location.accuracy);
    placeLines.push(
      hi
        ? `लोकेशन: ${mapsLink(location.lat, location.lng)}`
        : `Location: ${mapsLink(location.lat, location.lng)}`,
    );
    placeLines.push(hi ? `सटीकता: ${meters} मीटर` : `Accuracy: ${meters} m`);
  }
  return [
    hi ? "नमस्ते RKN Punjabi Soya Chaap," : "Hello RKN Punjabi Soya Chaap,",
    stamp,
    hi ? "मुझे यह ऑर्डर चाहिए:" : "I would like to order:",
    "",
    ...rows,
    "",
    hi ? `*कुल: ${inr(total)}*` : `*Total: ${inr(total)}*`,
    delivery,
    "",
    ...placeLines,
    "",
    hi
      ? "कृपया उपलब्धता और समय कन्फर्म करें। धन्यवाद।"
      : "Please confirm availability and timing. Thank you.",
  ].join("\n");
}

export function whatsAppUrl(
  text: string,
  whatsapp = getSite().whatsapp || DEFAULT_SITE.whatsapp,
): string {
  return `https://wa.me/${whatsapp}?text=${encodeURIComponent(text)}`;
}

export function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<CartLine>;
  if (typeof line.id !== "string" || typeof line.qty !== "number") return false;
  if (
    line.portion !== "half" &&
    line.portion !== "full" &&
    line.portion !== "single"
  )
    return false;
  if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > 30)
    return false;
  const item = findItemSafe(line.id);
  if (!item) return false;
  if (item.full == null && line.portion !== "single") return false;
  if (item.full != null && line.portion === "single") return false;
  return true;
}
