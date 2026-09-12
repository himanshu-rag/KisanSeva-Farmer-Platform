const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const db = new DatabaseSync('./kisanseva.db');
const schema = fs.readFileSync('./lib/locations.sql', 'utf8');
db.exec(schema);
console.log('Applied');
