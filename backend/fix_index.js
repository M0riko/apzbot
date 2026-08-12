const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('db/laundry.sqlite');
db.serialize(() => {
  db.run("DROP INDEX IF EXISTS idx_unique_booking", (err) => {
    if (err) console.error('Drop error:', err.message);
    else console.log('Index dropped');
  });
  db.run("CREATE UNIQUE INDEX idx_unique_booking ON Bookings(date, time_slot, machine_id) WHERE status = 'active'", (err) => {
    if (err) console.error('Create error:', err.message);
    else console.log('Index created with WHERE status = active');
  });
});
db.close();
