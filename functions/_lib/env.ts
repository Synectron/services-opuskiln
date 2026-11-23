/// <reference types="@cloudflare/workers-types" />

export type Env = {
  DB: D1Database;
  OWNER_EMAIL: string;
  OWNER_PASSWORD: string;
  SESSION_SECRET: string;
  OWNER_ROLE?: string;
  /** Optional — enables live Google Places reviews on /api/reviews */
  GOOGLE_PLACES_API_KEY?: string;
  /** Optional ChIJ… place id; if omitted, text search is used */
  GOOGLE_PLACE_ID?: string;
};

export type MenuRow = {
  id: string;
  category: string;
  name: string;
  name_hi: string;
  desc_en: string;
  desc_hi: string;
  half: number;
  full: number | null;
  unit: string;
  bestseller: number;
  active: number;
  sort_order: number;
  updated_at: string;
};

export type SettingsRow = {
  id: number;
  name: string;
  proprietor: string;
  phone_display: string;
  phone_tel: string;
  whatsapp: string;
  address_lines: string;
  address_lines_hi: string;
  locality: string;
  region: string;
  postal_code: string;
  map_query: string;
  lat: number;
  lng: number;
  hours_en: string;
  hours_hi: string;
  opens: string;
  closes: string;
  order_minutes: number;
  free_delivery: number;
  zomato: string;
  swiggy: string;
  magicpin: string;
  updated_at: string;
};

export type OrderStatus = "new" | "accepted" | "done" | "cancelled";

export type OrderRow = {
  id: string;
  status: OrderStatus;
  lang: string;
  customer_name: string;
  address: string;
  landmark: string;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  items_json: string;
  total: number;
  message: string;
  created_at: string;
  updated_at: string;
  customer_id: string | null;
  phone: string;
};
