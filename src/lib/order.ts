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
  return [
    hi ? "नमस्ते RKN Punjabi Soya Chaap," : "Hello RKN Punjabi Soya Chaap,",
    hi ? "मुझे यह ऑर्डर चाहिए:" : "I would like to order:",
    "",
    ...rows,
    "",
    hi ? `*कुल: ${inr(total)}*` : `*Total: ${inr(total)}*`,
    delivery,
    "",
    hi ? `नाम: ${who}` : `Name: ${who}`,
    hi ? `पता: ${where}` : `Address: ${where}`,
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
