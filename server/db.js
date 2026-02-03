import Database from 'better-sqlite3';

const db = new Database('wallestars.db', { verbose: console.log });

// Create logs table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    type TEXT NOT NULL,
    details TEXT
  )
`);

export default db;
