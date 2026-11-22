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
    "Shani Mandir Chauraha, In Front of Ranjeet Pandit Inter College, Naini, Prayagraj",
  lat: 25.399009,
  lng: 81.873037,
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

export function mapEmbedSrcFor(settings: ShopSettings): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(settings.mapQuery)}&z=16&output=embed`;
}

export function directionsHrefFor(settings: ShopSettings): string {
  return `https://maps.google.com/maps/dir/?api=1&destination=${encodeURIComponent(settings.mapQuery)}`;
}

export const mapEmbedSrc = mapEmbedSrcFor(DEFAULT_SITE);
export const directionsHref = directionsHrefFor(DEFAULT_SITE);
