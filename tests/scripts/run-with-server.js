// run-with-server.js - Start backend, wait ready, run tests, then shutdown
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const BACKEND_PORT = process.env.PORT || 3001;
const API_BASE = `http://localhost:${BACKEND_PORT}/api`;
const ROOT_DIR = path.join(__dirname, '..', '..');
const BACKEND_DIR = path.join(ROOT_DIR, 'back-end');
const TESTS_DIR = path.join(ROOT_DIR, 'tests');

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      // Consume response data to free up memory
      res.on('data', () => {});
      res.on('end', () => resolve(res));
    });
    req.on('error', reject);
    req.setTimeout(3000, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

async function waitForServer(url, timeoutMs = 30000, intervalMs = 1000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await httpGet(url);
      if (res.statusCode === 200) return true;
    } catch (_) {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return false;
}

async function main() {
  console.log('🚀 Starting backend for tests...');

  const env = {
    ...process.env,
    DATA_SOURCE: 'db',
    PORT: String(BACKEND_PORT),
    NODE_ENV: process.env.NODE_ENV || 'test',
  };

  const server = spawn('node', ['server.js'], {
    cwd: BACKEND_DIR,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverExited = false;
  server.on('exit', (code, signal) => {
    serverExited = true;
    console.log(`💥 Server process exited (code=${code}, signal=${signal})`);
  });

  server.stdout.on('data', (data) => {
    process.stdout.write(`[server] ${data}`);
  });
  server.stderr.on('data', (data) => {
    process.stderr.write(`[server:err] ${data}`);
  });

  // Wait until ready
  const ready = await waitForServer(`${API_BASE}/info`, 45000, 1000);
  if (!ready || serverExited) {
    console.error('❌ Backend did not become ready in time. Aborting tests.');
    try { server.kill('SIGINT'); } catch {}
    process.exit(1);
  }
  console.log('✅ Backend is ready. Running tests...');

  const testEnv = { ...process.env, TEST_API_URL: API_BASE };
  const testScript = path.join(TESTS_DIR, 'scripts', 'run-all-tests.js');
  const tester = spawn('node', [testScript], { cwd: TESTS_DIR, env: testEnv, stdio: 'inherit' });

  tester.on('exit', (code) => {
    console.log('🧹 Shutting down backend...');
    try { server.kill('SIGINT'); } catch {}

    // Give the server a moment to close gracefully
    const timeout = setTimeout(() => {
      try { server.kill('SIGKILL'); } catch {}
      process.exit(code || 0);
    }, 3000);

    server.on('exit', () => {
      clearTimeout(timeout);
      process.exit(code || 0);
    });
  });
}

main().catch((err) => {
  console.error('💥 Fatal error in test runner:', err);
  process.exit(1);
});
