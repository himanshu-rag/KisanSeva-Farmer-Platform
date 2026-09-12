-- KisanSeva Database Schema
-- Smart Procurement & Farmer Assistance Platform

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- Users (authentication)
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  mobile      TEXT UNIQUE NOT NULL,
  role        TEXT NOT NULL DEFAULT 'FARMER' CHECK (role IN ('FARMER','OPERATOR','ADMIN','SUPER_ADMIN')),
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile);

-- OTP codes (mock for prototype)
CREATE TABLE IF NOT EXISTS otp_codes (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  mobile      TEXT NOT NULL,
  code        TEXT NOT NULL,
  expires_at  TEXT NOT NULL,
  used        INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_otp_mobile ON otp_codes(mobile);

-- Farmers
CREATE TABLE IF NOT EXISTS farmers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  village       TEXT NOT NULL,
  district      TEXT,
  state         TEXT NOT NULL DEFAULT 'Haryana',
  primary_crop  TEXT NOT NULL,
  typical_qty   REAL,          -- quintals
  farmer_id     TEXT UNIQUE,   -- government ID (optional)
  language      TEXT NOT NULL DEFAULT 'hi',
  profile_photo TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_farmers_user ON farmers(user_id);

-- Crops catalogue
CREATE TABLE IF NOT EXISTS crops (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en     TEXT NOT NULL,
  name_hi     TEXT NOT NULL,
  name_pa     TEXT,
  emoji       TEXT NOT NULL DEFAULT '🌾',
  msp_per_qt  REAL NOT NULL,   -- MSP in INR per quintal
  season      TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1
);

-- Procurement Centres
CREATE TABLE IF NOT EXISTS procurement_centres (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  name_hi     TEXT,
  district    TEXT NOT NULL,
  state       TEXT NOT NULL DEFAULT 'Haryana',
  address     TEXT,
  lat         REAL,
  lng         REAL,
  total_capacity INTEGER NOT NULL DEFAULT 500, -- farmers per day
  counters    INTEGER NOT NULL DEFAULT 4,
  contact     TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Centre daily capacity
CREATE TABLE IF NOT EXISTS centre_capacity (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  centre_id   INTEGER NOT NULL REFERENCES procurement_centres(id),
  date        TEXT NOT NULL,
  total_slots INTEGER NOT NULL DEFAULT 500,
  booked      INTEGER NOT NULL DEFAULT 0,
  available   INTEGER GENERATED ALWAYS AS (total_slots - booked) STORED,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(centre_id, date)
);
CREATE INDEX IF NOT EXISTS idx_capacity_centre_date ON centre_capacity(centre_id, date);

-- Slots (hourly)
CREATE TABLE IF NOT EXISTS slots (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  centre_id   INTEGER NOT NULL REFERENCES procurement_centres(id),
  date        TEXT NOT NULL,
  slot_start  TEXT NOT NULL,   -- '08:00'
  slot_end    TEXT NOT NULL,   -- '09:00'
  capacity    INTEGER NOT NULL DEFAULT 60,
  booked      INTEGER NOT NULL DEFAULT 0,
  status      TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE','ALMOST_FULL','FULL','CLOSED')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(centre_id, date, slot_start)
);
CREATE INDEX IF NOT EXISTS idx_slots_centre_date ON slots(centre_id, date);

-- Tokens
CREATE TABLE IF NOT EXISTS tokens (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  token_no    TEXT UNIQUE NOT NULL,       -- e.g. 'A125'
  farmer_id   INTEGER NOT NULL REFERENCES farmers(id),
  centre_id   INTEGER NOT NULL REFERENCES procurement_centres(id),
  slot_id     INTEGER NOT NULL REFERENCES slots(id),
  crop_id     INTEGER NOT NULL REFERENCES crops(id),
  quantity    REAL NOT NULL,              -- quintals
  status      TEXT NOT NULL DEFAULT 'BOOKED'
              CHECK (status IN ('BOOKED','ARRIVED','VERIFIED','WEIGHED','PROCURED','CANCELLED')),
  booked_at   TEXT NOT NULL DEFAULT (datetime('now')),
  arrived_at  TEXT,
  verified_at TEXT,
  weighed_at  TEXT,
  procured_at TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_tokens_farmer ON tokens(farmer_id);
CREATE INDEX IF NOT EXISTS idx_tokens_centre ON tokens(centre_id);
CREATE INDEX IF NOT EXISTS idx_tokens_status ON tokens(status);
CREATE INDEX IF NOT EXISTS idx_tokens_slot ON tokens(slot_id);

-- Queue entries (live queue state)
CREATE TABLE IF NOT EXISTS queue_entries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  token_id    INTEGER UNIQUE NOT NULL REFERENCES tokens(id),
  centre_id   INTEGER NOT NULL REFERENCES procurement_centres(id),
  position    INTEGER NOT NULL,
  is_current  INTEGER NOT NULL DEFAULT 0,
  entered_at  TEXT NOT NULL DEFAULT (datetime('now')),
  served_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_queue_centre ON queue_entries(centre_id, position);

-- Procurements
CREATE TABLE IF NOT EXISTS procurements (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  token_id      INTEGER UNIQUE NOT NULL REFERENCES tokens(id),
  farmer_id     INTEGER NOT NULL REFERENCES farmers(id),
  centre_id     INTEGER NOT NULL REFERENCES procurement_centres(id),
  crop_id       INTEGER NOT NULL REFERENCES crops(id),
  quantity      REAL NOT NULL,
  msp_rate      REAL NOT NULL,
  total_value   REAL GENERATED ALWAYS AS (quantity * msp_rate) STORED,
  grade         TEXT DEFAULT 'A',
  moisture      REAL,           -- percentage
  status        TEXT NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING','PROCESSING','COMPLETED','REJECTED')),
  notes         TEXT,
  procured_at   TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_proc_farmer ON procurements(farmer_id);
CREATE INDEX IF NOT EXISTS idx_proc_centre ON procurements(centre_id);
CREATE INDEX IF NOT EXISTS idx_proc_status ON procurements(status);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  procurement_id INTEGER UNIQUE NOT NULL REFERENCES procurements(id),
  farmer_id     INTEGER NOT NULL REFERENCES farmers(id),
  amount        REAL NOT NULL,
  bank_ref      TEXT,           -- UTR/reference
  status        TEXT NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING','PROCESSING','COMPLETED','FAILED')),
  initiated_at  TEXT,
  completed_at  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pay_farmer ON payments(farmer_id);
CREATE INDEX IF NOT EXISTS idx_pay_status ON payments(status);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  farmer_id   INTEGER NOT NULL REFERENCES farmers(id),
  type        TEXT NOT NULL CHECK (type IN ('TOKEN','QUEUE','PROCUREMENT','PAYMENT','ALERT','SYSTEM')),
  title_en    TEXT NOT NULL,
  title_hi    TEXT,
  body_en     TEXT NOT NULL,
  body_hi     TEXT,
  is_read     INTEGER NOT NULL DEFAULT 0,
  sent_via    TEXT DEFAULT 'PUSH',  -- PUSH, SMS, WHATSAPP
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notif_farmer ON notifications(farmer_id, is_read);

-- AI Predictions
CREATE TABLE IF NOT EXISTS predictions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  centre_id       INTEGER NOT NULL REFERENCES procurement_centres(id),
  prediction_date TEXT NOT NULL,
  expected_count  INTEGER NOT NULL,
  peak_hour_start TEXT,
  peak_hour_end   TEXT,
  risk_level      TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW','MEDIUM','HIGH','CRITICAL')),
  recommendation  TEXT,
  model_version   TEXT DEFAULT 'v1.0',
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(centre_id, prediction_date)
);

-- Anomaly Alerts
CREATE TABLE IF NOT EXISTS anomaly_alerts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  farmer_id   INTEGER REFERENCES farmers(id),
  token_id    INTEGER REFERENCES tokens(id),
  alert_type  TEXT NOT NULL CHECK (alert_type IN ('DUPLICATE_BOOKING','UNUSUAL_QUANTITY','MULTIPLE_CENTRES','REPEAT_BOOKING','OTHER')),
  description TEXT NOT NULL,
  risk_level  TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (risk_level IN ('LOW','MEDIUM','HIGH')),
  status      TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','REVIEWED','RESOLVED','DISMISSED')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_anomaly_status ON anomaly_alerts(status);

-- Conversations (AI assistant)
CREATE TABLE IF NOT EXISTS conversations (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  farmer_id   INTEGER NOT NULL REFERENCES farmers(id),
  role        TEXT NOT NULL CHECK (role IN ('user','assistant')),
  message     TEXT NOT NULL,
  intent      TEXT,             -- detected intent
  language    TEXT DEFAULT 'hi',
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_conv_farmer ON conversations(farmer_id);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id),
  action      TEXT NOT NULL,
  entity      TEXT,
  entity_id   INTEGER,
  old_value   TEXT,
  new_value   TEXT,
  ip_address  TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity, entity_id);

-- Historical crowd data (for ML)
CREATE TABLE IF NOT EXISTS crowd_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  centre_id   INTEGER NOT NULL REFERENCES procurement_centres(id),
  date        TEXT NOT NULL,
  hour        INTEGER NOT NULL,  -- 0-23
  count       INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(centre_id, date, hour)
);

-- Service locations (State -> District -> Village)
CREATE TABLE IF NOT EXISTS service_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  UNIQUE(state, district, village)
);
