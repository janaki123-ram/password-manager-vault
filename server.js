import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new Database("./crm.db");

// Create table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS passwords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_name TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// GET all passwords
app.get("/api/passwords", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT * FROM passwords ORDER BY created_at DESC")
      .all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new password entry
app.post("/api/passwords", (req, res) => {
  const { site_name, username, password } = req.body;

  if (!site_name || !username || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const stmt = db.prepare(
      "INSERT INTO passwords (site_name, username, password) VALUES (?, ?, ?)",
    );
    const result = stmt.run(site_name, username, password);
    const newEntry = db
      .prepare("SELECT * FROM passwords WHERE id = ?")
      .get(result.lastInsertRowid);
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT (update) an existing entry
app.put("/api/passwords/:id", (req, res) => {
  const { id } = req.params;
  const { site_name, username, password } = req.body;

  try {
    db.prepare(
      "UPDATE passwords SET site_name = ?, username = ?, password = ? WHERE id = ?",
    ).run(site_name, username, password, id);
    const updated = db.prepare("SELECT * FROM passwords WHERE id = ?").get(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a password entry
app.delete("/api/passwords/:id", (req, res) => {
  const { id } = req.params;

  try {
    db.prepare("DELETE FROM passwords WHERE id = ?").run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
