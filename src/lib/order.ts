import {
  activePortion,
  findItem,
  itemName,
  portionName,
  unitPrice,
  type CartPortion,
  type Lang,
  type SizeChoice,
} from "../data/menu.ts";
import { SITE } from "../data/site.ts";

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

export function lineCost(line: CartLine): number {
  return unitPrice(findItem(line.id), line.portion) * line.qty;
}

export function orderTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + lineCost(line), 0);
}

export function orderCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

export function deliveryGap(total: number, threshold = SITE.freeDelivery): number {
  return Math.max(0, threshold - total);
}

export function portionForAdd(id: string, size: SizeChoice): CartPortion {
  return activePortion(findItem(id), size);
}

export function buildWhatsAppText(input: {
  lang: Lang;
  lines: CartLine[];
  name: string;
  address: string;
  landmark?: string;
  location?: SharedLocation | null;
}): string {
  const hi = input.lang === "hi";
  const rows = input.lines.map((line, index) => {
    const item = findItem(line.id);
    const title = itemName(item, input.lang);
    const portion = portionName(item, line.portion, input.lang);
    return `${index + 1}. ${title} (${portion}) × ${line.qty} — ${inr(lineCost(line))}`;
  });
  const total = orderTotal(input.lines);
  const gap = deliveryGap(total);
  const delivery =
    gap === 0
      ? hi
        ? "फ्री होम डिलीवरी (₹250 या उससे ऊपर का ऑर्डर)।"
        : "Free home delivery (order of ₹250 or more)."
      : hi
        ? `फ्री होम डिलीवरी ₹250 के ऑर्डर पर। इस ऑर्डर में ₹${gap} और जोड़ें।`
        : `Free home delivery is on orders of ₹250+. This order is ₹${gap} short.`;
  const who = input.name.trim().slice(0, 80) || "—";
  const where = input.address.trim().slice(0, 240) || "—";
  const landmark = input.landmark?.trim().slice(0, 160) ?? "";
  const location = input.location;
  const placeLines = [
    hi ? `नाम: ${who}` : `Name: ${who}`,
    hi ? `पता: ${where}` : `Address: ${where}`,
  ];
  if (landmark) placeLines.push(hi ? `लैंडमार्क: ${landmark}` : `Landmark: ${landmark}`);
  if (location) {
    const meters = accuracyMeters(location.accuracy);
    placeLines.push(hi ? `लोकेशन: ${mapsLink(location.lat, location.lng)}` : `Location: ${mapsLink(location.lat, location.lng)}`);
    placeLines.push(hi ? `सटीकता: ${meters} मीटर` : `Accuracy: ${meters} m`);
  }
  return [
    hi ? "नमस्ते RKN Punjabi Soya Chaap," : "Hello RKN Punjabi Soya Chaap,",
    hi ? "मुझे यह ऑर्डर चाहिए:" : "I would like to order:",
    "",
    ...rows,
    "",
    hi ? `*कुल: ${inr(total)}*` : `*Total: ${inr(total)}*`,
    delivery,
    "",
    ...placeLines,
    "",
    hi ? "कृपया उपलब्धता और समय कन्फर्म करें। धन्यवाद।" : "Please confirm availability and timing. Thank you.",
  ].join("\n");
}

export function whatsAppUrl(text: string): string {
  return `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<CartLine>;
  if (typeof line.id !== "string" || typeof line.qty !== "number") return false;
  if (line.portion !== "half" && line.portion !== "full" && line.portion !== "single") return false;
  if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > 30) return false;
  const item = MENU_SAFE(line.id);
  if (!item) return false;
  if (item.full == null && line.portion !== "single") return false;
  if (item.full != null && line.portion === "single") return false;
  return true;
}

function MENU_SAFE(id: string) {
  try {
    return findItem(id);
  } catch {
    return undefined;
  }
}
