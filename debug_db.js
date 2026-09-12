const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./kisanseva.db');

console.log('\n=== USERS ===');
const users = db.prepare('SELECT * FROM users').all();
console.log(JSON.stringify(users, null, 2));

console.log('\n=== FARMERS ===');
const farmers = db.prepare("SELECT * FROM farmers").all();
console.log(JSON.stringify(farmers, null, 2));

console.log('\n=== TOKENS ===');
const tokens = db.prepare('SELECT t.*, c.name as centre_name, s.slot_start, s.slot_end FROM tokens t LEFT JOIN procurement_centres c ON t.centre_id = c.id LEFT JOIN slots s ON t.slot_id = s.id ORDER BY t.id DESC LIMIT 10').all();
console.log(JSON.stringify(tokens, null, 2));

console.log('\n=== PROCUREMENT CENTRES ===');
const centres = db.prepare('SELECT * FROM procurement_centres').all();
console.log(JSON.stringify(centres, null, 2));

console.log('\n=== SLOTS (today) ===');
const slots = db.prepare("SELECT * FROM slots WHERE date = date('now') LIMIT 5").all();
console.log(JSON.stringify(slots, null, 2));

console.log('\n=== LOCATIONS ===');
try {
  const locs = db.prepare('SELECT * FROM service_locations').all();
  console.log(JSON.stringify(locs, null, 2));
} catch(e) { console.log('service_locations table not found:', e.message); }

console.log('\n=== QUEUE ===');
const queue = db.prepare('SELECT * FROM queue_entries ORDER BY id DESC LIMIT 10').all();
console.log(JSON.stringify(queue, null, 2));
