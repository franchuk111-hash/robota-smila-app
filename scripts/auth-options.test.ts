import assert from 'node:assert/strict';
import { GET } from '../app/api/auth-options/route';

async function main() {
  const keys = ['AUTH_SECRET', 'NEXTAUTH_SECRET', 'AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_USERNAME', 'NEXT_PUBLIC_TELEGRAM_BOT_USERNAME'] as const;
  const saved = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  const originalNow = Date.now;
  let now = 1800000000000;
  let calls = 0;
  let fixture: unknown = { ok: true, result: { is_bot: true, username: 'Fixture_bot' } };
  let status = 200;
  let failure = false;
  try {
    for (const key of keys) delete process.env[key];
    Date.now = () => now;
    globalThis.fetch = async (url, init) => {
      calls++;
      assert.equal(String(url), 'https://api.telegram.org/botfixture-token/getMe');
      assert.equal(init?.cache, 'no-store');
      assert.ok(init?.signal, 'discovery has a timeout signal');
      if (failure) throw new Error('mock network failure');
      return new Response(JSON.stringify(fixture), { status });
    };
    async function read(expected: { google: boolean; telegramUsername: string | null }) {
      const response = await GET(new Request("http://localhost/api/auth-options"));
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
      const body = await response.json();
      assert.deepEqual(body, expected);
      assert.deepEqual(Object.keys(body).sort(), ['google', 'telegramUsername']);
      assert.ok(!JSON.stringify(body).includes('fixture-token'));
      assert.ok(!JSON.stringify(body).includes('fixture-secret'));
    }
    const hidden = { google: false, telegramUsername: null };
    await read(hidden);
    assert.equal(calls, 0, 'no discovery without configuration');
    process.env.AUTH_SECRET = 'fixture-secret';
    await read(hidden);
    assert.equal(calls, 0, 'no discovery without bot token');
    process.env.TELEGRAM_BOT_TOKEN = 'fixture-token';
    for (const invalid of [null, {}, { ok: false }, { ok: true, result: { is_bot: false, username: 'Fixture_bot' } }, { ok: true, result: { is_bot: true, username: 'bad username' } }, { ok: true, result: { is_bot: true, username: 42 } }]) {
      fixture = invalid;
      const before: number = calls;
      await read(hidden);
      assert.equal(calls, before + 1, 'failed discovery is not cached');
    }
    fixture = { ok: true, result: { is_bot: true, username: 'Fixture_bot' } };
    status = 503;
    await read(hidden);
    status = 200;
    failure = true;
    await read(hidden);
    failure = false;
    await read({ google: false, telegramUsername: 'Fixture_bot' });
    const afterSuccess = calls;
    await read({ google: false, telegramUsername: 'Fixture_bot' });
    assert.equal(calls, afterSuccess, 'successful username discovery is cached');
    now += 300001;
    await read({ google: false, telegramUsername: 'Fixture_bot' });
    assert.equal(calls, afterSuccess + 1, 'cache expires after five minutes');
    delete process.env.TELEGRAM_BOT_TOKEN;
    await read(hidden);
    assert.equal(calls, afterSuccess + 1, 'cache cannot advertise disabled Telegram');
    process.env.TELEGRAM_BOT_TOKEN = 'fixture-token';
    process.env.TELEGRAM_BOT_USERNAME = 'Explicit_bot';
    process.env.AUTH_GOOGLE_ID = 'fixture-client';
    process.env.AUTH_GOOGLE_SECRET = 'fixture-secret';
    await read({ google: true, telegramUsername: 'Explicit_bot' });
    assert.equal(calls, afterSuccess + 1, 'explicit runtime username avoids discovery');
    console.log('PASS: auth-options mocked getMe, no-token bypass, invalid/network/HTTP fail-closed behavior, cache/expiry, public-only response and explicit runtime configuration.');
  } finally {
    globalThis.fetch = originalFetch;
    Date.now = originalNow;
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
