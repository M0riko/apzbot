const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'laundry.sqlite');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function runInit() {
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  const db = new sqlite3.Database(DB_PATH);

  db.serialize(() => {
    db.exec(schema, (err) => {
      if (err) {
        console.error('Schema init error:', err.message);
        db.close();
        process.exit(1);
      }

      const stmt = db.prepare('INSERT INTO Machines (name, status) VALUES (?, ?)');
      const machines = ['Пральна 1', 'Пральна 2', 'Пральна 3'];
      machines.forEach((name) => stmt.run(name, 'active'));
      stmt.finalize(() => {
        console.log('DB initialized and machines seeded.');
        db.close();
      });
    });
  });
}

runInit();
