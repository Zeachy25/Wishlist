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

export const cacheProducts = async (products: any[]) => {
  const database = getDb();
  const insertStmt = database.prepareSync(
    'INSERT OR REPLACE INTO products (id, name, current_price, image_url, category) VALUES (?, ?, ?, ?, ?)'
  );
  for (const p of products) {
    insertStmt.executeAsync(p.id, p.name, p.current_price, p.image_url, p.category);
  }
};

export const clearCache = () => {
  const database = getDb();
  database.execSync('DELETE FROM products; DELETE FROM wishlist_items;');
};

export const getCachedProducts = async (): Promise<any[]> => {
  const database = getDb();
  const rows = await database.getAllAsync('SELECT * FROM products');
  return rows.map((r: any) => ({
    id: r.id,
    name: r.name,
    current_price: r.current_price,
    image_url: r.image_url,
    category: r.category,
  }));
};
