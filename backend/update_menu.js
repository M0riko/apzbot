require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const https = require('https');

const token = process.env.BOT_TOKEN;
const url = process.env.WEBAPP_URL;

const data = JSON.stringify({
  menu_button: {
    type: 'web_app',
    text: 'Відкрити пральню',
    web_app: { url: url }
  }
});

const req = https.request({
  hostname: 'api.telegram.org',
  port: 443,
  path: `/bot${token}/setChatMenuButton`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
}, (res) => {
  res.on('data', (d) => process.stdout.write(d));
});

req.write(data);
req.end();
