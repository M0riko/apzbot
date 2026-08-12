const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('laundry.sqlite');

const queries = [
  `CREATE TABLE IF NOT EXISTS ProfileChangeRequests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    new_full_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES Users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS Settings (
    key TEXT PRIMARY KEY,
    value TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS SentNotifications (
    booking_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    sent_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (booking_id, type)
  )`,
  `INSERT OR IGNORE INTO Settings (key, value) VALUES ('monthly_limit', '12')`
];

db.serialize(() => {
  queries.forEach(q => {
    db.run(q, (err) => {
      if (err) console.error('Error:', err.message);
      else console.log('Query executed successfully');
    });
  });
});

db.close();
