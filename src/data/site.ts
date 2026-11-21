export const SITE = {
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
} as const;

export const mapEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(SITE.mapQuery)}&z=16&output=embed`;

export const directionsHref = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(SITE.mapQuery)}`;
