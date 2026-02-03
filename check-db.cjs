const Database = require("better-sqlite3");
const db = new Database("database.db");

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log("Tables:", tables.map(t => t.name).join(", "));

  const userCount = db.prepare("SELECT COUNT(*) as count FROM users").get();
  console.log("Users:", userCount);

  const postCount = db.prepare("SELECT COUNT(*) as count FROM posts").get();
  console.log("Posts:", postCount);

  const catCount = db.prepare("SELECT COUNT(*) as count FROM categories").get();
  console.log("Categories:", catCount);

  const tagCount = db.prepare("SELECT COUNT(*) as count FROM tags").get();
  console.log("Tags:", tagCount);
} catch (e) {
  console.error("Error:", e.message);
} finally {
  db.close();
}
