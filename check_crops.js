const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./kisanseva.db');
console.log('Crops:', JSON.stringify(db.prepare('SELECT * FROM crops').all()));
