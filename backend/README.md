# Backend (Step 1-4)

## Structure
- db/schema.sql — SQL schema
- db/init_db.js — SQLite initialization + seed machines
- db/laundry.sqlite — SQLite database (created after init)

## Init DB
1. Install dependency: sqlite3
2. Run: node db/init_db.js

This creates tables and seeds 3 machines.

## Run server + bot
1. Copy .env.example to .env and fill BOT_TOKEN + WEBAPP_URL
2. Install deps: npm install
3. Start: npm start

Health check: GET /health

## API
- GET /api/state?date=YYYY-MM-DD
- POST /api/book { date, time_slot, machine_id }
- POST /api/buy { washes }

All API calls require header x-telegram-init (Telegram WebApp initData).
