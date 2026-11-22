CREATE TABLE menu_items (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('chinese', 'chaap', 'tandoori', 'momos')),
  name TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  desc_en TEXT NOT NULL,
  desc_hi TEXT NOT NULL,
  half INTEGER NOT NULL CHECK (half > 0),
  full INTEGER CHECK (full IS NULL OR full >= half),
  unit TEXT NOT NULL CHECK (unit IN ('plate', 'momo-12', 'momo-6', 'momo-5', 'single')),
  bestseller INTEGER NOT NULL DEFAULT 0 CHECK (bestseller IN (0, 1)),
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX menu_items_active_sort ON menu_items (active, sort_order, category);

CREATE TABLE shop_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL,
  proprietor TEXT NOT NULL,
  phone_display TEXT NOT NULL,
  phone_tel TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  address_lines TEXT NOT NULL,
  address_lines_hi TEXT NOT NULL,
  locality TEXT NOT NULL,
  region TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  map_query TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  hours_en TEXT NOT NULL,
  hours_hi TEXT NOT NULL,
  opens TEXT NOT NULL,
  closes TEXT NOT NULL,
  order_minutes INTEGER NOT NULL,
  free_delivery INTEGER NOT NULL,
  zomato TEXT NOT NULL,
  swiggy TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
