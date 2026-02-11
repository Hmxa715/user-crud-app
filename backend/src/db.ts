import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const db = open({
  filename: "database.db",
  driver: sqlite3.Database,
});

// Run once on app start
export async function initDB() {
  const database = await db;

  // Create users table if it does not exist
  await database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Optional: insert seed data only if table is empty
  const row = await database.get(`SELECT COUNT(*) as count FROM users`);

  if (row.count === 0) {
    await database.run(
      `INSERT INTO users (name, email) VALUES 
        ('Admin User', 'admin@example.com'),
        ('Test User', 'test@example.com')`
    );
  }
}
