const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('./kisanseva.db');
db.prepare("UPDATE farmers SET name = 'Himanshu' WHERE id = 1").run();
console.log('Fixed DB');
