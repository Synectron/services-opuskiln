export type ShopSettings = {
  name: string;
  proprietor: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsapp: string;
  addressLines: string[];
  addressLinesHi: string[];
  locality: string;
  region: string;
  postalCode: string;
  mapQuery: string;
  lat: number;
  lng: number;
  hoursEn: string;
  hoursHi: string;
  opens: string;
  closes: string;
  orderMinutes: number;
  freeDelivery: number;
  zomato: string;
  swiggy: string;
  magicpin: string;
  updatedAt?: string;
};

/** Static defaults — also used as API fallback and D1 seed source. */
export const DEFAULT_SITE: ShopSettings = {
  name: "RKN Punjabi Soya Chaap",
  proprietor: "Raju Soni",
  phoneDisplay: "9140587645",
  phoneTel: "+919140587645",
  whatsapp: "919140587645",
  addressLines: [
    "Shani Mandir Chauraha",
    "In Front of Ranjeet Pandit Inter College",
    "Naini, Prayagraj, Uttar Pradesh 211008",
  ],
  addressLinesHi: [
    "शनि मंदिर चौराहा",
    "रणजीत पंडित इंटर कॉलेज के सामने",
    "नैनी, प्रयागराज, उत्तर प्रदेश 211008",
  ],
  locality: "Naini, Prayagraj",
  region: "Uttar Pradesh",
  postalCode: "211008",
  mapQuery:
    "Pure Veg RKN Punjabi Soya Chaap, Shani Mandir Chauraha, Naini, Prayagraj",
  lat: 25.3990085,
  lng: 81.8730367,
  hoursEn: "Open daily, 10 am – 11 pm",
  hoursHi: "रोज़ खुला, सुबह 10 से रात 11 बजे तक",
  opens: "10:00",
  closes: "23:00",
  orderMinutes: 20,
  freeDelivery: 250,
  zomato: "https://www.zomato.com/allahabad",
  swiggy: "https://www.swiggy.com/city/allahabad",
  magicpin:
    "https://magicpin.in/Allahabad/Naini/Restaurant/Pure-Veg-Rkn-Punjabi-Soya-Chaap/store/203c06a",
};

/** @deprecated Prefer getSite() from runtime — kept for tests and seed. */
export const SITE = DEFAULT_SITE;

/**
 * Official Google Maps listing:
 * Pure Veg RKN Punjabi Soya Chaap
 * https://maps.app.goo.gl/WcEaZnDy5wM2RRCK8
 * place 0x39854b84620db801:0xfa16478572a97c2f (cid 18020669597449550895)
 */
export const GOOGLE_MAPS_PLACE_URL =
  "https://maps.app.goo.gl/WcEaZnDy5wM2RRCK8";
export const GOOGLE_MAPS_CID = "18020669597449550895";

export function mapEmbedSrcFor(settings: ShopSettings): string {
  // Embed the Google Business pin (name + marker), not a bare lat/lng drop.
  return `https://maps.google.com/maps?cid=${GOOGLE_MAPS_CID}&ll=${settings.lat},${settings.lng}&z=17&output=embed`;
}

export function directionsHrefFor(_settings: ShopSettings): string {
  return GOOGLE_MAPS_PLACE_URL;
}

export const mapEmbedSrc = mapEmbedSrcFor(DEFAULT_SITE);
export const directionsHref = directionsHrefFor(DEFAULT_SITE);
