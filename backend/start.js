/**
 * start.js — Автоматичний запуск через Localtunnel:
 *  1. Запускає npx localtunnel на порту 3000
 *  2. Витягує згенерований URL https://*.loca.lt
 *  3. Записує його в .env як WEBAPP_URL
 *  4. Оновлює меню бота за допомогою update_menu.js
 *  5. Запускає server.js
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ENV_PATH = path.join(__dirname, '.env');
const PORT = 3000;

function readEnv() {
  return fs.readFileSync(ENV_PATH, 'utf8');
}

function setEnvValue(content, key, value) {
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(content)) {
    return content.replace(regex, `${key}=${value}`);
  }
  return content + `\n${key}=${value}`;
}

function saveEnv(content) {
  fs.writeFileSync(ENV_PATH, content, 'utf8');
}

console.log('🚀 Запуск Localtunnel...');

const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';

const lt = spawn(npxCmd, ['localtunnel', '--port', String(PORT)], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true
});

let urlFound = false;
let serverProcess = null;

function onLtOutput(data) {
  const text = data.toString();
  process.stdout.write('[localtunnel] ' + text);

  if (!urlFound) {
    const match = text.match(/https:\/\/[a-z0-9-]+\.loca\.lt/i);
    if (match) {
      const tunnelUrl = match[0];
      urlFound = true;

      console.log(`\n✅ Tunnel URL: ${tunnelUrl}`);
      console.log('📝 Оновлюю .env...');

      let envContent = readEnv();
      envContent = setEnvValue(envContent, 'WEBAPP_URL', tunnelUrl);
      saveEnv(envContent);

      console.log('🟢 .env оновлено. Оновлюю меню бота...');
      
      const menuUpdate = spawn(process.execPath, ['update_menu.js'], { cwd: __dirname });
      menuUpdate.stdout.on('data', (d) => console.log('[menu] ' + d));
      menuUpdate.on('close', () => {
        console.log('✅ Меню бота оновлено. Запускаю сервер...\n');
        startServer();
      });
    }
  }
}

function startServer() {
  if (serverProcess) {
    serverProcess.kill();
  }
  
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: { ...process.env }
  });

  serverProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(`\n⚠️  server.js завершився з помилкою (код ${code}). Перезапуск за 3 сек...`);
      setTimeout(startServer, 3000);
    }
  });
}

lt.stdout.on('data', onLtOutput);
lt.stderr.on('data', onLtOutput);

lt.on('exit', (code) => {
  if (!urlFound) {
    console.error(`\n❌ Localtunnel завершився без URL (код ${code}).`);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Завершення роботи...');
  if (serverProcess) serverProcess.kill();
  lt.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (serverProcess) serverProcess.kill();
  lt.kill();
  process.exit(0);
});

// Timeout if no URL found in 30s
setTimeout(() => {
  if (!urlFound) {
    console.error('\n❌ Localtunnel не дав URL за 30 секунд. Зупинка.');
    lt.kill();
    process.exit(1);
  }
}, 30000);
