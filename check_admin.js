const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./kisanseva.db');
const admins = db.prepare("SELECT id, mobile, role FROM users WHERE role != 'FARMER'").all();
console.log('Admin users:', JSON.stringify(admins));
