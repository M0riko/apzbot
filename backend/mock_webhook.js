const http = require('http');

const paymentKey = process.argv[2];
const amount = process.argv[3] || 50; // default 50 UAH

if (!paymentKey && process.argv[2] !== 'lost') {
  console.log('Usage: node mock_webhook.js <PAYMENT_KEY> [AMOUNT_IN_UAH]');
  console.log('To mock a lost payment: node mock_webhook.js lost [AMOUNT_IN_UAH]');
  process.exit(1);
}

const isLost = process.argv[2] === 'lost';
const comment = isLost ? '' : paymentKey;

const payload = JSON.stringify({
  statementItem: {
    id: `mock_mono_${Date.now()}`,
    amount: amount * 100, // in kopecks
    comment: comment,
    senderName: 'Test Sender'
  }
});

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/webhooks/monobank',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (isLost) {
    console.log('✅ Моковий "загублений" платіж відправлено! Перевірте кнопку "Не прийшла оплата" в UI.');
  } else {
    console.log(`✅ Моковий платіж з кодом ${paymentKey} відправлено! Оновіть сторінку в UI.`);
  }
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(payload);
req.end();
