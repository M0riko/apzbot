// Fetches recent Monobank jar transactions and replays any missed ones through our webhook
const https = require('https');
const http = require('http');
require('dotenv').config();

const MONO_TOKEN = process.env.MONOBANK_API_TOKEN;
const SERVER_PORT = process.env.PORT || 3000;

function monoGet(path) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.monobank.ua',
      path,
      method: 'GET',
      headers: { 'X-Token': MONO_TOKEN }
    }, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { reject(new Error('Invalid JSON: ' + data)); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function replayWebhook(statementItem) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ statementItem });
    const req = http.request({
      hostname: 'localhost',
      port: SERVER_PORT,
      path: '/api/webhooks/monobank',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, (res) => {
      res.resume();
      resolve(res.statusCode);
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('📥 Отримуємо дані акаунту Monobank...');
  const info = await monoGet('/personal/client-info');

  if (info.errorDescription) {
    console.error('❌ Помилка API:', info.errorDescription);
    process.exit(1);
  }

  console.log(`👤 Клієнт: ${info.name}`);
  console.log('📋 Рахунки:', info.accounts?.map(a => `${a.id} (${a.currencyCode})`).join(', '));
  if (info.jars?.length) {
    console.log('🏦 Банки:', info.jars.map(j => `${j.title}: ${j.id}`).join(', '));
  }

  // Find the jar account
  const jar = info.jars?.find(j => j.id);
  if (!jar) {
    console.error('❌ Банок не знайдено на цьому акаунті');
    process.exit(1);
  }

  // Get transactions for last 7 days
  const from = Math.floor(Date.now() / 1000) - 7 * 86400;
  const to = Math.floor(Date.now() / 1000);

  // Find the "На апз" jar
  const apzJar = info.jars.find(j => j.title.toLowerCase().includes('апз')) || info.jars[0];
  console.log(`\n📊 Перевіряємо банку "${apzJar.title}" за 7 днів...`);

  await new Promise(r => setTimeout(r, 600));
  const statement = await monoGet(`/personal/statement/${apzJar.id}/${from}/${to}`);

  if (!Array.isArray(statement) || statement.length === 0) {
    console.log('❌ Транзакцій не знайдено за 7 днів у банці "На апз".');
    console.log('\nВсі ваші банки:');
    info.jars.forEach(j => console.log(`  "${j.title}" → ${j.id}`));
    process.exit(0);
  }

  console.log(`\n💸 Знайдено ${statement.length} транзакцій:`);
  for (const tx of statement) {
    const amount = tx.amount / 100;
    const comment = tx.comment || '(без коментаря)';
    const time = new Date(tx.time * 1000).toLocaleString('uk-UA');
    console.log(`  [${time}] +${amount} грн | "${comment}"`);
  }

  console.log('\n🔄 Відтворюємо через вебхук...');
  for (const tx of statement) {
    const status = await replayWebhook({
      id: tx.id,
      amount: tx.amount,
      comment: tx.comment || '',
      senderName: tx.description || 'Monobank'
    });
    console.log(`  ✅ ${tx.amount/100} грн — HTTP ${status}`);
  }

  console.log('\n✅ Готово! Перевірте баланс у додатку.');
}

main().catch(err => {
  console.error('❌ Помилка:', err.message);
  process.exit(1);
});
