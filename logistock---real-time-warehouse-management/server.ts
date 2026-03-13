import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("inventory.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('admin', 'staff'))
  );

  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE
  );

  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    name TEXT,
    category_id INTEGER,
    stock INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    location TEXT,
    FOREIGN KEY(category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER,
    type TEXT CHECK(type IN ('in', 'out')),
    quantity INTEGER,
    user_id INTEGER,
    person_name TEXT,
    supplier TEXT,
    notes TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(item_id) REFERENCES items(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Seed initial data if empty
const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
if (userCount.count === 0) {
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("admin", "admin123", "admin");
  db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run("kurir", "kurir123", "staff");
  
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Packing");
  db.prepare("INSERT INTO categories (name) VALUES (?)").run("Office");
  
  db.prepare("INSERT INTO items (code, name, category_id, stock, min_stock, location) VALUES (?, ?, ?, ?, ?, ?)").run("LKB-01", "Lakban Besar", 1, 50, 10, "Rak A-1");
  db.prepare("INSERT INTO items (code, name, category_id, stock, min_stock, location) VALUES (?, ?, ?, ?, ?, ?)").run("KRD-02", "Kardus Sedang", 1, 100, 20, "Rak B-2");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth API
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    const user = db.prepare("SELECT id, username, role FROM users WHERE username = ? AND password = ?").get(username, password) as any;
    if (user) {
      res.json(user);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // Categories API
  app.get("/api/categories", (req, res) => {
    const categories = db.prepare("SELECT * FROM categories").all();
    res.json(categories);
  });

  // Items API
  app.get("/api/items", (req, res) => {
    const items = db.prepare(`
      SELECT items.*, categories.name as category_name 
      FROM items 
      LEFT JOIN categories ON items.category_id = categories.id
    `).all();
    res.json(items);
  });

  app.post("/api/items", (req, res) => {
    const { code, name, category_id, stock, min_stock, location } = req.body;
    try {
      const result = db.prepare("INSERT INTO items (code, name, category_id, stock, min_stock, location) VALUES (?, ?, ?, ?, ?, ?)").run(code, name, category_id, stock, min_stock, location);
      res.json({ id: result.lastInsertRowid });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put("/api/items/:id", (req, res) => {
    const { code, name, category_id, stock, min_stock, location } = req.body;
    db.prepare("UPDATE items SET code = ?, name = ?, category_id = ?, stock = ?, min_stock = ?, location = ? WHERE id = ?").run(code, name, category_id, stock, min_stock, location, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/items/:id", (req, res) => {
    db.prepare("DELETE FROM items WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Transactions API
  app.post("/api/transactions", (req, res) => {
    const { item_id, type, quantity, user_id, person_name, supplier, notes } = req.body;
    
    const dbTransaction = db.transaction(() => {
      // Update stock
      if (type === 'in') {
        db.prepare("UPDATE items SET stock = stock + ? WHERE id = ?").run(quantity, item_id);
      } else {
        const item = db.prepare("SELECT stock FROM items WHERE id = ?").get(item_id) as any;
        if (item.stock < quantity) throw new Error("Insufficient stock");
        db.prepare("UPDATE items SET stock = stock - ? WHERE id = ?").run(quantity, item_id);
      }

      // Record transaction
      db.prepare(`
        INSERT INTO transactions (item_id, type, quantity, user_id, person_name, supplier, notes) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(item_id, type, quantity, user_id, person_name, supplier, notes);
    });

    try {
      dbTransaction();
      res.json({ success: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get("/api/transactions", (req, res) => {
    const logs = db.prepare(`
      SELECT transactions.*, items.name as item_name, users.username as staff_name
      FROM transactions
      JOIN items ON transactions.item_id = items.id
      JOIN users ON transactions.user_id = users.id
      ORDER BY timestamp DESC
      LIMIT 100
    `).all();
    res.json(logs);
  });

  app.get("/api/stats", (req, res) => {
    const totalItems = db.prepare("SELECT COUNT(*) as count FROM items").get() as any;
    const totalStock = db.prepare("SELECT SUM(stock) as count FROM items").get() as any;
    const criticalItems = db.prepare("SELECT COUNT(*) as count FROM items WHERE stock <= min_stock").get() as any;
    
    const recentActivity = db.prepare(`
      SELECT transactions.*, items.name as item_name
      FROM transactions
      JOIN items ON transactions.item_id = items.id
      ORDER BY timestamp DESC
      LIMIT 5
    `).all();

    const chartData = db.prepare(`
      SELECT DATE(timestamp) as date, SUM(CASE WHEN type='out' THEN quantity ELSE 0 END) as usage
      FROM transactions
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
      LIMIT 7
    `).all();

    res.json({
      totalItems: totalItems.count,
      totalStock: totalStock.count || 0,
      criticalItems: criticalItems.count,
      recentActivity,
      chartData: chartData.reverse()
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
