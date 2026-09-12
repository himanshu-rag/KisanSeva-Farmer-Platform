// @ts-expect-error Types for node:sqlite are not in definitely typed yet
import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'kisanseva.db');
const SCHEMA_PATH = path.join(process.cwd(), 'lib', 'schema.sql');

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    
    // Init schema if needed
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
    _db.exec(schema);
  }
  return _db;
}

export default getDb;
