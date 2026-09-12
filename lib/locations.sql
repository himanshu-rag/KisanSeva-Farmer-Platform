CREATE TABLE IF NOT EXISTS service_locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  village TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  UNIQUE(state, district, village)
);

INSERT OR IGNORE INTO service_locations (state, district, village) VALUES 
('Haryana', 'Karnal', 'Sirsali'),
('Haryana', 'Karnal', 'Gharaunda'),
('Haryana', 'Karnal', 'Nilokheri'),
('Haryana', 'Panipat', 'Samalkha'),
('Haryana', 'Panipat', 'Bapoli'),
('Haryana', 'Ambala', 'Naraingarh'),
('Punjab', 'Patiala', 'Rajpura'),
('Punjab', 'Patiala', 'Nabha'),
('Punjab', 'Ludhiana', 'Khanna');
