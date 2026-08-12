const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/laundry.sqlite');
db.get("SELECT COUNT(*) as count FROM Users WHERE is_registered = 1", (err, row) => {
  console.log('Registered users:', row ? row.count : 0);
  db.close();
});
