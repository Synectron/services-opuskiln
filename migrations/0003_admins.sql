CREATE TABLE admins (
  email TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')),
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX admins_active_role ON admins (active, role);
