import assert from "node:assert/strict";
import { test } from "node:test";
import { MENU, findItem, unitPrice } from "../data/menu.ts";
import { SITE } from "../data/site.ts";
import {
  accuracyMeters,
  buildWhatsAppText,
  deliveryGap,
  mapsLink,
  orderTotal,
  whatsAppUrl,
  type CartLine,
} from "./order.ts";

test("the printed card is complete and uniquely priced", () => {
  assert.equal(MENU.length, 40);
  assert.equal(MENU.filter((item) => item.category === "chinese").length, 16);
  assert.equal(MENU.filter((item) => item.category === "chaap").length, 10);
  assert.equal(MENU.filter((item) => item.category === "tandoori").length, 7);
  assert.equal(MENU.filter((item) => item.category === "momos").length, 7);
  assert.equal(new Set(MENU.map((item) => item.id)).size, 40);
  for (const item of MENU) {
    assert.ok(item.half > 0);
    if (item.full != null) assert.ok(item.full >= item.half);
  }
});

test("known card prices", () => {
  const price = (id: string) => {
    const item = findItem(id);
    return [item.half, item.full];
  };
  assert.deepEqual(price("chilli-potato"), [40, 80]);
  assert.deepEqual(price("chilli-paneer"), [100, 180]);
  assert.deepEqual(price("finger-chips"), [40, 70]);
  assert.deepEqual(price("tikki-burger"), [40, null]);
  assert.deepEqual(price("spring-roll"), [60, null]);
  assert.deepEqual(price("rkn-roll"), [50, null]);
  assert.deepEqual(price("malai-chaap"), [100, 180]);
  assert.deepEqual(price("hariyali-chaap"), [120, 200]);
  assert.deepEqual(price("chaap-biryani"), [50, 100]);
  assert.deepEqual(price("afghani-momos"), [140, 270]);
  assert.deepEqual(price("jhol-momos"), [70, 130]);
  assert.deepEqual(price("veg-steam"), [20, 40]);
  assert.deepEqual(price("paneer-kurkure"), [80, 150]);
  assert.deepEqual(price("cheese-kurkure"), [90, 100]);
  assert.deepEqual(price("mix-kurkure"), [50, 170]);
  assert.equal(unitPrice(findItem("tikki-burger"), "full"), 40);
  assert.equal(findItem("malai-chaap").bestseller, true);
  assert.equal(findItem("afghani-chaap").bestseller, true);
  assert.equal(findItem("hariyali-chaap").bestseller, true);
});

test("cart total, delivery gap, and WhatsApp message", () => {
  const lines: CartLine[] = [
    { id: "malai-chaap", portion: "full", qty: 2 },
    { id: "veg-steam", portion: "half", qty: 1 },
  ];
  assert.equal(orderTotal(lines), 380);
  assert.equal(deliveryGap(380), 0);
  assert.equal(deliveryGap(200), 50);
  assert.equal(SITE.freeDelivery, 250);
  assert.equal(SITE.whatsapp, "919140587645");

  const text = buildWhatsAppText({
    lang: "en",
    lines,
    name: "Anita",
    address: "House 12, Naini",
    orderedAt: new Date("2026-11-22T12:05:09+05:30"),
  });
  assert.match(text, /Date: .*2026.* · Time: .* IST/);
  assert.match(text, /Malai Soya Chaap \(Full\) × 2 — ₹360/);
  assert.match(text, /Veg Steam Momos \(6 pc\) × 1 — ₹20/);
  assert.match(text, /\*Total: ₹380\*/);
  assert.match(text, /Free home delivery/);
  assert.match(text, /Name: Anita/);
  assert.match(text, /Address: House 12, Naini/);

  const url = whatsAppUrl(text);
  assert.ok(url.startsWith("https://wa.me/919140587645?text="));
  assert.match(decodeURIComponent(url), /Anita/);
  assert.match(decodeURIComponent(url), /₹380/);

  const hindi = buildWhatsAppText({
    lang: "hi",
    lines: [{ id: "tikki-burger", portion: "single", qty: 1 }],
    name: "",
    address: "",
    orderedAt: new Date("2026-11-22T12:05:09+05:30"),
  });
  assert.match(hindi, /तारीख: .* · समय: .* IST/);
  assert.match(hindi, /टिक्की बर्गर \(एक प्लेट\) × 1 — ₹40/);
  assert.match(hindi, /नाम: —/);
  assert.match(hindi, /पता: —/);
  assert.match(hindi, /₹210 और जोड़ें/);
  assert.equal(hindi.includes("maps.google.com"), false);
});

test("WhatsApp message includes an optional exact location", () => {
  const text = buildWhatsAppText({
    lang: "en",
    lines: [{ id: "soya-chaap", portion: "half", qty: 1 }],
    name: "Anita",
    address: "House 12, Naini",
    landmark: "Blue gate",
    location: { lat: 25.399009, lng: 81.873037, accuracy: 17.4 },
  });
  const link = mapsLink(25.399009, 81.873037);
  assert.equal(link, "https://maps.google.com/?q=25.399009,81.873037");
  assert.equal(accuracyMeters(17.4), 17);
  assert.match(text, /Landmark: Blue gate/);
  assert.match(
    text,
    new RegExp(`Location: ${link.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`),
  );
  assert.match(text, /Accuracy: 17 m/);
  assert.match(
    decodeURIComponent(whatsAppUrl(text)),
    /https:\/\/maps\.google\.com\/\?q=25\.399009,81\.873037/,
  );

  const hindi = buildWhatsAppText({
    lang: "hi",
    lines: [{ id: "soya-chaap", portion: "half", qty: 1 }],
    name: "अनीता",
    address: "मकान 12",
    landmark: "नीला गेट",
    location: { lat: 25.399009, lng: 81.873037, accuracy: 8 },
  });
  assert.match(hindi, /लैंडमार्क: नीला गेट/);
  assert.match(
    hindi,
    /लोकेशन: https:\/\/maps\.google\.com\/\?q=25\.399009,81\.873037/,
  );
  assert.match(hindi, /सटीकता: 8 मीटर/);
});
