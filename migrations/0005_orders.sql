CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'accepted', 'done', 'cancelled')),
  lang TEXT NOT NULL DEFAULT 'en' CHECK (lang IN ('en', 'hi')),
  customer_name TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  landmark TEXT NOT NULL DEFAULT '',
  lat REAL,
  lng REAL,
  accuracy REAL,
  items_json TEXT NOT NULL,
  total INTEGER NOT NULL CHECK (total >= 0),
  message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX orders_status_created ON orders (status, created_at DESC);
CREATE INDEX orders_created ON orders (created_at DESC);
