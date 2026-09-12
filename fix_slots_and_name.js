const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./kisanseva.db');

// 1. The farmer name is 'Himanshu' but the API uses d.data.farmer.name
// The farmers/me API returns the full farmer object — check if 'name' field works
// Confirmed: name = 'Himanshu'. The issue might be the API returns column 'name'
// but the home page uses `farmer.name` -> should work if API returns it

// 2. CRITICAL: Slots are dated 2026-09-10, but today is 2026-09-11
// The booking page will find NO slots for today. Fix: update slot dates to today + generate slots
const today = new Date().toISOString().split('T')[0];
console.log('Updating slots to today:', today);

// Update existing slots to today
db.prepare(`UPDATE slots SET date = ? WHERE date = '2026-09-10'`).run(today);
console.log('Updated', db.prepare('SELECT COUNT(*) as c FROM slots').get().c, 'slots to today');

// Also update token booked_at date so they appear as active
db.prepare(`UPDATE tokens SET booked_at = datetime('now') WHERE status = 'BOOKED'`).run();
console.log('Updated BOOKED token timestamps');

// 3. The farmers/me name issue: check what the API actually returns
// The API does: db.prepare('SELECT * FROM farmers WHERE user_id = ?').get(userId)
// But the farmers table doesn't have 'name' in schema originally?
// Let's verify the actual DB has name column
const farmer = db.prepare('SELECT name, village FROM farmers WHERE id = 1').get();
console.log('Farmer name check:', farmer);

// 4. Check if farmers/route.ts saves name correctly
// The POST saves: name, village, govt_id - but farmers table has no govt_id column
const pragma = db.prepare("PRAGMA table_info(farmers)").all();
console.log('Has govt_id?', pragma.some(c => c.name === 'govt_id'));

// 5. Add govt_id column if missing
const hasGovtId = pragma.some(c => c.name === 'govt_id');
if (!hasGovtId) {
  db.exec('ALTER TABLE farmers ADD COLUMN govt_id TEXT');
  console.log('Added govt_id column');
}

console.log('Done!');
