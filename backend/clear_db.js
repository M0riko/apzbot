const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const usePostgres = !!process.env.DATABASE_URL;

const dropQueries = [
  'DROP TABLE IF EXISTS SentNotifications CASCADE',
  'DROP TABLE IF EXISTS ProfileChangeRequests CASCADE',
  'DROP TABLE IF EXISTS PrivilegeRequests CASCADE',
  'DROP TABLE IF EXISTS UnresolvedPayments CASCADE',
  'DROP TABLE IF EXISTS Transactions CASCADE',
  'DROP TABLE IF EXISTS Payments CASCADE',
  'DROP TABLE IF EXISTS Bookings CASCADE',
  'DROP TABLE IF EXISTS Machines CASCADE',
  'DROP TABLE IF EXISTS Users CASCADE',
  'DROP TABLE IF EXISTS Settings CASCADE'
];

async function clearDatabase() {
  if (usePostgres) {
    console.log('🔄 Підключення до PostgreSQL для очищення...');
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    try {
      for (const query of dropQueries) {
        console.log(`Executing: ${query}`);
        await pool.query(query);
      }
      console.log('✅ Всі таблиці PostgreSQL успішно видалено!');
    } catch (err) {
      console.error('❌ Помилка при очищенні PostgreSQL:', err.message);
    } finally {
      await pool.end();
    }
  } else {
    console.log('🔄 Очищення локальної SQLite...');
    const DB_PATH = path.join(__dirname, 'db', 'laundry.sqlite');
    if (fs.existsSync(DB_PATH)) {
      try {
        fs.unlinkSync(DB_PATH);
        console.log('✅ Файл laundry.sqlite успішно видалено (локальну базу очищено)!');
      } catch (err) {
        console.error('❌ Не вдалося видалити файл SQLite:', err.message);
      }
    } else {
      console.log('ℹ️ Локальної бази SQLite не знайдено (вона вже чиста).');
    }
  }
}

clearDatabase();
