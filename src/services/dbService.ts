import { SQLiteDatabase, openDatabaseSync } from 'expo-sqlite';

let db: SQLiteDatabase;

export const initDb = async () => {
  if (!db) {
    db = openDatabaseSync('wishlist.db');
  }

  // Create tables for offline support
  db.execSync(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      current_price NUMERIC NOT NULL,
      image_url TEXT,
      category TEXT
    );
    CREATE TABLE IF NOT EXISTS wishlist_items (
      product_id TEXT PRIMARY KEY,
      target_price NUMERIC
    );
  `);
};

export const getDb = () => {
  if (!db) throw new Error('Database not initialized');
  return db;
};
