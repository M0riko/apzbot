require('dotenv').config();
const http = require('http');

const PORT = process.env.PORT || 3000;
const userId = process.argv[2];
const washes = Number(process.argv[3] || 1);

if (!userId) {
  console.log('Usage: node add_balance.js <userId> [washes]');
  process.exit(1);
}

// Get all users first
const opts = (path, method = 'GET', body) => ({
  hostname: 'localhost', port: PORT,
  path, method,
  headers: {
    'Content-Type': 'application/json',
    'x-admin-secret': process.env.ADMIN_SECRET || 'laundry_admin_2024',
    ...(body ? { 'Content-Length': Buffer.byteLength(JSON.stringify(body)) } : {})
  }
});

function req(path, method = 'GET', body) {
  return new Promise((resolve, reject) => {
    const r = http.request(opts(path, method, body), res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function main() {
  // list users
  if (userId === 'list') {
    const res = await req('/api/admin/users');
    console.log('\nКористувачі:');
    res.users.forEach(u => console.log(`  ID: ${u.id} | @${u.username || '—'} | Баланс: ${u.balance}`));
    return;
  }

  const res = await req('/api/admin/users/balance', 'POST', { userId: Number(userId), delta: washes });
  if (res.ok) {
    console.log(`✅ Баланс оновлено! Новий баланс: ${res.user.balance} прань`);
  } else {
    console.log('❌ Помилка:', res.error);
  }
}

main().catch(console.error);
