export type Lang = "en" | "hi";
export type CategoryId = "chinese" | "chaap" | "tandoori" | "momos";
export type Unit = "plate" | "momo-12" | "momo-6" | "momo-5" | "single";
export type CartPortion = "half" | "full" | "single";
export type SizeChoice = "half" | "full";

export type MenuItem = {
  id: string;
  category: CategoryId;
  name: string;
  nameHi: string;
  desc: string;
  descHi: string;
  half: number;
  full: number | null;
  unit: Unit;
  bestseller?: boolean;
};

export const CATEGORIES: { id: CategoryId; en: string; hi: string }[] = [
  { id: "chinese", en: "Chinese", hi: "चाइनीज़" },
  { id: "chaap", en: "Soya Chaap", hi: "सोया चाप" },
  { id: "tandoori", en: "Tandoori Momos", hi: "तंदूरी मोमोज़" },
  { id: "momos", en: "Momos", hi: "मोमोज़" },
];

// Prices are transcribed from the printed RKN menu card (half / full).
// Plates with full: null had no full price on the card.
export const MENU: MenuItem[] = [
  {
    id: "chilli-potato",
    category: "chinese",
    name: "Chilli Potato",
    nameHi: "चिल्ली पोटैटो",
    desc: "Crisp potatoes in a hot, tangy chilli toss.",
    descHi: "क्रिस्प आलू, तीखी चटपटी चिल्ली सॉस में।",
    half: 40,
    full: 80,
    unit: "plate",
  },
  {
    id: "veg-chowmein",
    category: "chinese",
    name: "Veg Chowmein",
    nameHi: "वेज चाउमीन",
    desc: "Wok-fried noodles with vegetables.",
    descHi: "सब्ज़ियों के साथ वोक में तले नूडल्स।",
    half: 30,
    full: 60,
    unit: "plate",
  },
  {
    id: "schezwan-chowmein",
    category: "chinese",
    name: "Schezwan Chowmein",
    nameHi: "शेजवान चाउमीन",
    desc: "Chowmein with a sharper Schezwan heat.",
    descHi: "शेजवान के तीखे स्वाद वाला चाउमीन।",
    half: 50,
    full: 100,
    unit: "plate",
  },
  {
    id: "veg-hakka",
    category: "chinese",
    name: "Veg Hakka Noodles",
    nameHi: "वेज हक्का नूडल्स",
    desc: "Hakka-style noodles, dry and smoky from the wok.",
    descHi: "वोक की खुशबू वाले हक्का नूडल्स।",
    half: 50,
    full: 100,
    unit: "plate",
  },
  {
    id: "rkn-noodles",
    category: "chinese",
    name: "RKN Noodles",
    nameHi: "आरकेएन नूडल्स",
    desc: "The house noodle plate.",
    descHi: "घर की खास नूडल प्लेट।",
    half: 60,
    full: 110,
    unit: "plate",
  },
  {
    id: "schezwan-rice",
    category: "chinese",
    name: "Schezwan Fried Rice",
    nameHi: "शेजवान फ्राइड राइस",
    desc: "Fried rice with Schezwan heat.",
    descHi: "शेजवान मसाले वाला फ्राइड राइस।",
    half: 50,
    full: 100,
    unit: "plate",
  },
  {
    id: "veg-rice",
    category: "chinese",
    name: "Veg Fried Rice",
    nameHi: "वेज फ्राइड राइस",
    desc: "Vegetable fried rice.",
    descHi: "सब्ज़ियों वाला फ्राइड राइस।",
    half: 30,
    full: 60,
    unit: "plate",
  },
  {
    id: "manchurian-gravy",
    category: "chinese",
    name: "Veg Manchurian Gravy",
    nameHi: "वेज मंचूरियन ग्रेवी",
    desc: "Soft vegetable balls in a glossy gravy.",
    descHi: "नरम वेज बॉल्स, चमकती ग्रेवी में।",
    half: 40,
    full: 70,
    unit: "plate",
  },
  {
    id: "manchurian-dry",
    category: "chinese",
    name: "Veg Manchurian Dry",
    nameHi: "वेज मंचूरियन ड्राई",
    desc: "The same balls, tossed dry and hot.",
    descHi: "वही बॉल्स, ड्राई और तीखे तड़के में।",
    half: 60,
    full: 110,
    unit: "plate",
  },
  {
    id: "manchurian-noodles",
    category: "chinese",
    name: "Manchurian with Noodles",
    nameHi: "मंचूरियन विद नूडल्स",
    desc: "Manchurian ladled over noodles.",
    descHi: "नूडल्स के ऊपर मंचूरियन।",
    half: 60,
    full: 110,
    unit: "plate",
  },
  {
    id: "manchuria-rice",
    category: "chinese",
    name: "Manchuria with Rice",
    nameHi: "मंचूरिया विद राइस",
    desc: "Manchurian with fried rice, as printed on the card.",
    descHi: "मंचूरियन के साथ फ्राइड राइस।",
    half: 60,
    full: 110,
    unit: "plate",
  },
  {
    id: "chilli-paneer",
    category: "chinese",
    name: "Chilli Paneer Gravy",
    nameHi: "चिल्ली पनीर ग्रेवी",
    desc: "Paneer in a chilli gravy.",
    descHi: "चिल्ली ग्रेवी में पनीर।",
    half: 100,
    full: 180,
    unit: "plate",
  },
  {
    id: "tikki-burger",
    category: "chinese",
    name: "Tikki Burger",
    nameHi: "टिक्की बर्गर",
    desc: "A crisp tikki in a bun.",
    descHi: "बन में कुरकुरी टिक्की।",
    half: 40,
    full: null,
    unit: "single",
  },
  {
    id: "spring-roll",
    category: "chinese",
    name: "Veg Spring Roll",
    nameHi: "वेज स्प्रिंग रोल",
    desc: "Fried vegetable spring rolls.",
    descHi: "तले हुए वेज स्प्रिंग रोल।",
    half: 60,
    full: null,
    unit: "single",
  },
  {
    id: "rkn-roll",
    category: "chinese",
    name: "RKN Roll",
    nameHi: "आरकेएन रोल",
    desc: "The house roll.",
    descHi: "घर का रोल।",
    half: 50,
    full: null,
    unit: "single",
  },
  {
    id: "finger-chips",
    category: "chinese",
    name: "Finger Chips",
    nameHi: "फिंगर चिप्स",
    desc: "Salted potato fingers.",
    descHi: "नमकीन फिंगर चिप्स।",
    half: 40,
    full: 70,
    unit: "plate",
  },
  {
    id: "soya-chaap",
    category: "chaap",
    name: "Soya Chaap",
    nameHi: "सोया चाप",
    desc: "Soya chaap from the tandoor.",
    descHi: "तंदूर की सोया चाप।",
    half: 90,
    full: 170,
    unit: "plate",
  },
  {
    id: "amritsari",
    category: "chaap",
    name: "Amritsari Chaap",
    nameHi: "अमृतसरी चाप",
    desc: "Amritsari spices and a tandoor char.",
    descHi: "अमृतसरी मसाला, तंदूर का कोयला।",
    half: 100,
    full: 180,
    unit: "plate",
  },
  {
    id: "tandoori-chaap",
    category: "chaap",
    name: "Tandoori Soya Chaap",
    nameHi: "तंदूरी सोया चाप",
    desc: "The classic red tandoor chaap.",
    descHi: "क्लासिक लाल तंदूरी चाप।",
    half: 90,
    full: 170,
    unit: "plate",
  },
  {
    id: "afghani-chaap",
    category: "chaap",
    name: "Afghani Soya Chaap",
    nameHi: "अफगानी सोया चाप",
    desc: "Cream, mild spice, and a soft char.",
    descHi: "मलाई, हल्का मसाला, और नरम कोयला।",
    half: 100,
    full: 180,
    unit: "plate",
    bestseller: true,
  },
  {
    id: "pahadi-chaap",
    category: "chaap",
    name: "Pahadi Soya Chaap",
    nameHi: "पहाड़ी सोया चाप",
    desc: "Hill-style spices on soya chaap.",
    descHi: "पहाड़ी मसालों वाली सोया चाप।",
    half: 90,
    full: 170,
    unit: "plate",
  },
  {
    id: "hyderabadi-chaap",
    category: "chaap",
    name: "Hyderabadi Soya Chaap",
    nameHi: "हैदराबादी सोया चाप",
    desc: "Hyderabadi masala on the chaap.",
    descHi: "हैदराबादी मसाले वाली चाप।",
    half: 100,
    full: 180,
    unit: "plate",
  },
  {
    id: "malai-chaap",
    category: "chaap",
    name: "Malai Soya Chaap",
    nameHi: "मलाई सोया चाप",
    desc: "A malai marinade and a tandoor finish.",
    descHi: "मलाई में डूबी चाप, तंदूर पर सिकी।",
    half: 100,
    full: 180,
    unit: "plate",
    bestseller: true,
  },
  {
    id: "chaap-biryani",
    category: "chaap",
    name: "Soya Chaap Biryani",
    nameHi: "सोया चाप बिरयानी",
    desc: "Chaap layered with spiced rice.",
    descHi: "मसाले वाले चावल के साथ चाप।",
    half: 50,
    full: 100,
    unit: "plate",
  },
  {
    id: "masala-chaap",
    category: "chaap",
    name: "Masala Soya Chaap",
    nameHi: "मसाला सोया चाप",
    desc: "A heavier masala coat.",
    descHi: "गाढ़े मसाले में लिपटी चाप।",
    half: 110,
    full: 200,
    unit: "plate",
  },
  {
    id: "hariyali-chaap",
    category: "chaap",
    name: "Hariyali Soya Chaap",
    nameHi: "हरियाली सोया चाप",
    desc: "Green herb marinade, then the tandoor.",
    descHi: "हरी चटनी के मसाले में चाप, फिर तंदूर।",
    half: 120,
    full: 200,
    unit: "plate",
    bestseller: true,
  },
  {
    id: "tandoori-momos",
    category: "tandoori",
    name: "Tandoori Momos",
    nameHi: "तंदूरी मोमोज़",
    desc: "Momos finished in the tandoor.",
    descHi: "तंदूर में सिंके मोमोज़।",
    half: 90,
    full: 170,
    unit: "momo-12",
  },
  {
    id: "afghani-momos",
    category: "tandoori",
    name: "Afghani Momos",
    nameHi: "अफगानी मोमोज़",
    desc: "Creamy Afghani momos.",
    descHi: "मलाईदार अफगानी मोमोज़।",
    half: 140,
    full: 270,
    unit: "momo-12",
  },
  {
    id: "malai-momos",
    category: "tandoori",
    name: "Malai Momos",
    nameHi: "मलाई मोमोज़",
    desc: "Malai-coated momos.",
    descHi: "मलाई में लिपटे मोमोज़।",
    half: 120,
    full: 220,
    unit: "momo-12",
  },
  {
    id: "hariyali-momos",
    category: "tandoori",
    name: "Hariyali Momos",
    nameHi: "हरियाली मोमोज़",
    desc: "Green herb tandoori momos.",
    descHi: "हरे मसाले वाले तंदूरी मोमोज़।",
    half: 100,
    full: 180,
    unit: "momo-12",
  },
  {
    id: "kashmiri-momos",
    category: "tandoori",
    name: "Kashmiri Momos",
    nameHi: "कश्मीरी मोमोज़",
    desc: "A milder Kashmiri masala.",
    descHi: "हल्का कश्मीरी मसाला।",
    half: 100,
    full: 180,
    unit: "momo-12",
  },
  {
    id: "creamy-momos",
    category: "tandoori",
    name: "Creamy Momos",
    nameHi: "क्रीमी मोमोज़",
    desc: "A rich, creamy coat.",
    descHi: "गाढ़ी क्रीमी लेयर।",
    half: 100,
    full: 180,
    unit: "momo-12",
  },
  {
    id: "jhol-momos",
    category: "tandoori",
    name: "Jhol Momos Nepali Swad",
    nameHi: "झोल मोमोज़ नेपाली स्वाद",
    desc: "Nepali-style jhol, a thin spiced gravy.",
    descHi: "नेपाली स्वाद वाला पतला झोल।",
    half: 70,
    full: 130,
    unit: "momo-12",
  },
  {
    id: "veg-steam",
    category: "momos",
    name: "Veg Steam Momos",
    nameHi: "वेज स्टीम मोमोज़",
    desc: "Steamed vegetable momos.",
    descHi: "भाप में पके वेज मोमोज़।",
    half: 20,
    full: 40,
    unit: "momo-6",
  },
  {
    id: "veg-fry",
    category: "momos",
    name: "Veg Fry Momos",
    nameHi: "वेज फ्राई मोमोज़",
    desc: "The same momos, pan-fried.",
    descHi: "वही मोमोज़, तवे पर तले।",
    half: 30,
    full: 60,
    unit: "momo-6",
  },
  {
    id: "paneer-steam",
    category: "momos",
    name: "Paneer Steam Momos",
    nameHi: "पनीर स्टीम मोमोज़",
    desc: "Steamed momos filled with paneer.",
    descHi: "पनीर भरे स्टीम मोमोज़।",
    half: 40,
    full: 80,
    unit: "momo-6",
  },
  {
    id: "paneer-fry",
    category: "momos",
    name: "Paneer Fry Momos",
    nameHi: "पनीर फ्राई मोमोज़",
    desc: "Paneer momos, fried.",
    descHi: "तले हुए पनीर मोमोज़।",
    half: 50,
    full: 90,
    unit: "momo-6",
  },
  {
    id: "paneer-kurkure",
    category: "momos",
    name: "Paneer Kurkure Momos",
    nameHi: "पनीर कुरकुरे मोमोज़",
    desc: "Paneer momos in a kurkure shell.",
    descHi: "कुरकुरी परत में पनीर मोमोज़।",
    half: 80,
    full: 150,
    unit: "momo-6",
  },
  {
    id: "cheese-kurkure",
    category: "momos",
    name: "RKN Cheese Kurkure Momos",
    nameHi: "आरकेएन चीज़ कुरकुरे मोमोज़",
    desc: "The house cheese kurkure momos.",
    descHi: "घर के चीज़ कुरकुरे मोमोज़।",
    half: 90,
    full: 100,
    unit: "momo-6",
  },
  {
    id: "mix-kurkure",
    category: "momos",
    name: "Mix Kurkure Momos",
    nameHi: "मिक्स कुरकुरे मोमोज़",
    desc: "A mixed kurkure plate. Count is 5 and 10 pieces.",
    descHi: "मिक्स कुरकुरे। गिनती 5 और 10 पीस।",
    half: 50,
    full: 170,
    unit: "momo-5",
  },
];

export function findItemIn(items: readonly MenuItem[], id: string): MenuItem {
  const item = items.find((entry) => entry.id === id);
  if (!item) throw new Error(`Unknown menu item: ${id}`);
  return item;
}

/** Looks up against the static seed menu (tests / offline fallback). Prefer runtime findItem when live. */
export function findItem(id: string): MenuItem {
  return findItemIn(MENU, id);
}

export function itemName(item: MenuItem, lang: Lang): string {
  return lang === "hi" ? item.nameHi : item.name;
}

export function itemDesc(item: MenuItem, lang: Lang): string {
  return lang === "hi" ? item.descHi : item.desc;
}

export function activePortion(item: MenuItem, size: SizeChoice): CartPortion {
  return item.full == null ? "single" : size;
}

export function unitPrice(item: MenuItem, portion: CartPortion): number {
  if (item.full == null || portion !== "full") return item.half;
  return item.full;
}

export function portionName(item: MenuItem, portion: CartPortion, lang: Lang): string {
  if (item.full == null || portion === "single") {
    return lang === "hi" ? "एक प्लेट" : "One plate";
  }
  const full = portion === "full";
  if (item.unit === "momo-12") return full ? (lang === "hi" ? "24 पीस" : "24 pc") : lang === "hi" ? "12 पीस" : "12 pc";
  if (item.unit === "momo-6") return full ? (lang === "hi" ? "12 पीस" : "12 pc") : lang === "hi" ? "6 पीस" : "6 pc";
  if (item.unit === "momo-5") return full ? (lang === "hi" ? "10 पीस" : "10 pc") : lang === "hi" ? "5 पीस" : "5 pc";
  return full ? (lang === "hi" ? "फुल" : "Full") : lang === "hi" ? "हाफ" : "Half";
}

export function otherPortionLine(item: MenuItem, size: SizeChoice, lang: Lang): string | null {
  if (item.full == null) return null;
  const other: CartPortion = size === "half" ? "full" : "half";
  return `${portionName(item, other, lang)} · ₹${unitPrice(item, other)}`;
}
