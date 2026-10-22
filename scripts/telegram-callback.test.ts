import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { completeTelegramCallback } from '../lib/telegram-callback';

async function main() {
  const events: string[] = [];
  const href = 'https://robota-smila.com.ua/uvijty/telegram?id=123&auth_date=1234&hash=fixture&first_name=Test';
  assert.equal(await completeTelegramCallback(href, path => events.push('clear:' + path), async payload => {
    assert.deepEqual(events, ['clear:/uvijty/telegram']);
    assert.deepEqual(JSON.parse(payload), { id: '123', auth_date: '1234', hash: 'fixture', first_name: 'Test' });
    events.push('verify');
    return { ok: true };
  }, path => events.push('navigate:' + path)), true);
  assert.deepEqual(events, ['clear:/uvijty/telegram', 'verify', 'navigate:/profil']);
  for (const query of ['', '?id=123', '?id=1&id=2&auth_date=1&hash=x', '?id=1&auth_date=1&hash=x&callbackUrl=https://evil.example']) {
    let cleared = false;
    assert.equal(await completeTelegramCallback('https://robota-smila.com.ua/uvijty/telegram' + query, () => { cleared = true; }, async () => { assert.fail('invalid query must not authenticate'); }, () => assert.fail('must not navigate')), false);
    assert.equal(cleared, true);
  }
  for (const result of [undefined, { ok: false }, { ok: true, error: 'CredentialsSignin' }]) {
    assert.equal(await completeTelegramCallback(href, () => {}, async () => result, () => assert.fail('failed auth must not navigate')), false);
  }
  assert.equal(await completeTelegramCallback(href, () => {}, async () => { throw new Error('mock'); }, () => assert.fail()), false);
  const widget = readFileSync(new URL('../components/TelegramLogin.tsx', import.meta.url), 'utf8');
  assert.ok(widget.includes('data-auth-url'));
  assert.ok(!widget.includes('data-onauth') && !widget.includes('data-request-access') && !widget.includes('onTelegramAuth'));
  const page = readFileSync(new URL('../app/uvijty/telegram/page.tsx', import.meta.url), 'utf8');
  assert.ok(page.includes('index: false') && page.includes("referrer: 'no-referrer'"));
  console.log('PASS: redirect widget without eval callback, immediate URL clearing, strict query parsing, verified-only fixed navigation, failure handling and noindex callback.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
