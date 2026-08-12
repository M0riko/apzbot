const https = require('https');
require('dotenv').config();

const token = process.env.MONOBANK_API_TOKEN;
const webhookUrl = process.env.WEBAPP_URL + '/api/webhooks/monobank';

if (!token) {
  console.error('❌ MONOBANK_API_TOKEN не вказано в .env');
  process.exit(1);
}

console.log(`📡 Реєструємо вебхук: ${webhookUrl}`);

const body = JSON.stringify({ webHookUrl: webhookUrl });

const req = https.request({
  hostname: 'api.monobank.ua',
  port: 443,
  path: '/personal/webhook',
  method: 'POST',
  headers: {
    'X-Token': token,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    if (data === '{}' || res.statusCode === 200) {
      console.log('✅ Вебхук успішно зареєстровано!');
    } else {
      console.log('❌ Помилка:', data);
    }
  });
});

req.on('error', e => console.error('❌ Помилка мережі:', e.message));
req.write(body);
req.end();
