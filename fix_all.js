const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./kisanseva.db');

// 1. Check farmer 1's name
const farmer = db.prepare('SELECT * FROM farmers WHERE id = 1').get();
console.log('Farmer 1:', farmer);

// 2. Slots for today - slots exist but with different dates 
const anySlot = db.prepare('SELECT date, count(*) as c FROM slots GROUP BY date ORDER BY date DESC LIMIT 5').all();
console.log('Slot dates:', anySlot);

// 3. Today's date
const today = new Date().toISOString().split('T')[0];
console.log('Today:', today);

// 4. Check the farmers table column for name
const pragma = db.prepare("PRAGMA table_info(farmers)").all();
console.log('Farmers columns:', pragma.map(c => c.name));
