import assert from 'node:assert/strict';
import { telegramDomainReady } from '../lib/telegram-readiness';
import { GET } from '../app/api/auth-options/route';

async function main() {
  const savedFetch = globalThis.fetch;
  const savedNow = Date.now;
  const keys = ['AUTH_SECRET', 'NEXTAUTH_SECRET', 'AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_BOT_USERNAME', 'NEXT_PUBLIC_TELEGRAM_BOT_USERNAME'] as const;
  const saved = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  let now = 1800000000000;
  let calls = 0;
  let html = '<html>Telegram Login</html>';
  let status = 200;
  let failure = false;
  try {
    Date.now = () => now;
    globalThis.fetch = async (input, init) => {
      calls++;
      const url = new URL(String(input));
      assert.equal(url.origin, 'https://oauth.telegram.org');
      assert.ok(url.pathname.startsWith('/embed/'));
      assert.ok(['https://robota-smila.com.ua', 'https://www.robota-smila.com.ua'].includes(url.searchParams.get('origin')!));
      assert.ok(!url.href.includes('fixture-token'));
      assert.equal(init?.cache, 'no-store');
      assert.ok(init?.signal);
      if (failure) throw new Error('mock transport failure');
      return new Response(html, { status });
    };
    const origin = 'https://robota-smila.com.ua';
    assert.equal(await telegramDomainReady('Ready_bot', origin), true);
    assert.equal(await telegramDomainReady('Ready_bot', origin), true);
    assert.equal(calls, 1, 'reuse five-minute readiness cache');
    html = 'Bot domain invalid';
    assert.equal(await telegramDomainReady('Invalid_bot', origin), false);
    html = '<html>Telegram Login</html>';
    assert.equal(await telegramDomainReady('Invalid_bot', origin), false, 'cache negative result too');
    assert.equal(await telegramDomainReady('Ready_bot', 'https://www.robota-smila.com.ua'), true, 'cache includes origin');
    now += 300001;
    assert.equal(await telegramDomainReady('Invalid_bot', origin), true, 'negative cache expires');
    status = 503;
    assert.equal(await telegramDomainReady('HttpFailure_bot', origin), false);
    status = 200;
    failure = true;
    assert.equal(await telegramDomainReady('NetworkFailure_bot', origin), false);
    failure = false;
    html = '';
    assert.equal(await telegramDomainReady('Empty_bot', origin), false);
    const beforeInvalid = calls;
    assert.equal(await telegramDomainReady('Ready_bot', 'https://evil.example'), false);
    assert.equal(await telegramDomainReady('bad username', origin), false);
    assert.equal(calls, beforeInvalid);
    for (const key of keys) delete process.env[key];
    process.env.AUTH_SECRET = 'fixture-secret';
    process.env.TELEGRAM_BOT_TOKEN = 'fixture-token';
    process.env.TELEGRAM_BOT_USERNAME = 'Integration_bot';
    html = 'Bot domain invalid';
    const prod = await GET(new Request(origin + '/api/auth-options'));
    assert.deepEqual(await prod.json(), { google: false, telegramUsername: null });
    assert.equal(prod.headers.get('Cache-Control'), 'private, no-store');
    const beforeLocal = calls;
    assert.deepEqual(await (await GET(new Request('http://localhost/api/auth-options'))).json(), { google: false, telegramUsername: 'Integration_bot' });
    assert.equal(calls, beforeLocal, 'local fixtures do not call Telegram');
    console.log('PASS: production domain readiness, invalid-domain/HTTP/network/empty fail closed, cache expiry and username/origin keys, local probe bypass.');
  } finally {
    globalThis.fetch = savedFetch;
    Date.now = savedNow;
    for (const key of keys) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
