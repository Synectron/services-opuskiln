CREATE TABLE customers (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX customers_phone ON customers (phone);

ALTER TABLE orders ADD COLUMN customer_id TEXT REFERENCES customers(id);
ALTER TABLE orders ADD COLUMN phone TEXT NOT NULL DEFAULT '';

CREATE INDEX orders_customer_id ON orders (customer_id);
CREATE INDEX orders_phone ON orders (phone);
