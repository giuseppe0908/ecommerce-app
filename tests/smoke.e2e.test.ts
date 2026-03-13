import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import test from 'node:test';

function randomPort() {
  return 4300 + Math.floor(Math.random() * 300);
}

async function waitForHttpReady(url: string, timeoutMs = 30000) {
  const startedAt = Date.now();
  let lastError: unknown;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.status < 500) {
        return;
      }
      lastError = new Error(`Server responded with status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`Smoke server not ready in ${timeoutMs}ms. Last error: ${String(lastError)}`);
}

async function stopProcess(child: ReturnType<typeof spawn>) {
  if (child.exitCode !== null || child.signalCode !== null) {
    return;
  }

  child.kill('SIGTERM');
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      if (child.exitCode === null && child.signalCode === null) {
        child.kill('SIGKILL');
      }
      resolve();
    }, 3000);

    child.once('exit', () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

test(
  'smoke e2e: built server responds on critical pages and API routes',
  { timeout: 120000 },
  async (t) => {
    const port = randomPort();
    const host = '127.0.0.1';
    const baseUrl = `http://${host}:${port}`;
    const serverLogs: string[] = [];

    const child = spawn('node', ['.output/server/index.mjs'], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        PORT: String(port),
        NITRO_PORT: String(port),
        HOST: host,
        NITRO_HOST: host,
        JWT_SECRET: process.env.JWT_SECRET || 'smoke-jwt-secret',
        APP_BASE_URL: baseUrl,
        BASE_URL: baseUrl,
        STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_smoke',
        GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || 'smoke-github-id',
        GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || 'smoke-github-secret',
        GITHUB_CALLBACK_URL:
          process.env.GITHUB_CALLBACK_URL || `${baseUrl}/api/auth/github/callback`,
        AI_CHAT_ENABLED: process.env.AI_CHAT_ENABLED || 'false',
        AI_CHAT_PROVIDER: process.env.AI_CHAT_PROVIDER || 'ollama',
        DATABASE_URL:
          process.env.DATABASE_URL || 'mysql://root:@127.0.0.1:3306/smoke_ecommerce',
        DIRECT_DATABASE_URL:
          process.env.DIRECT_DATABASE_URL || 'mysql://root:@127.0.0.1:3306/smoke_ecommerce',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk) => {
      serverLogs.push(chunk.toString());
    });
    child.stderr.on('data', (chunk) => {
      serverLogs.push(chunk.toString());
    });

    t.after(async () => {
      await stopProcess(child);
    });

    await waitForHttpReady(`${baseUrl}/api/login`);

    const loginPage = await fetch(`${baseUrl}/login`);
    assert.equal(
      loginPage.status,
      200,
      `GET /login status is ${loginPage.status}. Logs: ${serverLogs.join('')}`
    );

    const loginGet = await fetch(`${baseUrl}/api/login`);
    assert.equal(
      loginGet.status,
      405,
      `GET /api/login status is ${loginGet.status}. Logs: ${serverLogs.join('')}`
    );

    const loginPost = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: '',
      }),
    });
    assert.equal(
      loginPost.status,
      400,
      `POST /api/login status is ${loginPost.status}. Logs: ${serverLogs.join('')}`
    );

    const meResponse = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(
      meResponse.status,
      401,
      `GET /api/auth/me status is ${meResponse.status}. Logs: ${serverLogs.join('')}`
    );

    const adminStatistics = await fetch(`${baseUrl}/api/admin/statistics`);
    assert.equal(
      adminStatistics.status,
      401,
      `GET /api/admin/statistics status is ${adminStatistics.status}. Logs: ${serverLogs.join('')}`
    );

    const chatStatus = await fetch(`${baseUrl}/api/chat/status`);
    assert.equal(
      chatStatus.status,
      200,
      `GET /api/chat/status status is ${chatStatus.status}. Logs: ${serverLogs.join('')}`
    );
    const chatStatusPayload = await chatStatus.json();
    assert.equal(
      chatStatusPayload.enabled,
      false,
      `GET /api/chat/status enabled is ${String(chatStatusPayload.enabled)}. Logs: ${serverLogs.join('')}`
    );
    assert.equal(
      chatStatusPayload.available,
      false,
      `GET /api/chat/status available is ${String(chatStatusPayload.available)}. Logs: ${serverLogs.join('')}`
    );

    const chatMessage = await fetch(`${baseUrl}/api/chat/ollama`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        message: 'Ciao',
      }),
    });
    assert.equal(
      chatMessage.status,
      503,
      `POST /api/chat/ollama status is ${chatMessage.status}. Logs: ${serverLogs.join('')}`
    );

    const draftCheckout = await fetch(`${baseUrl}/api/order/order`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'cliente@example.com',
        products: [],
      }),
    });
    assert.equal(
      draftCheckout.status,
      400,
      `POST /api/order/order status is ${draftCheckout.status}. Logs: ${serverLogs.join('')}`
    );
  }
);
