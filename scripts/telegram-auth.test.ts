import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { verifyTelegramPayload } from '../lib/telegram-auth';

async function main() {
  const token = 'test-only-not-a-real-bot-token';
  const now = 1800000000;
  function signed(fields: Record<string, unknown>) {
    const text = Object.keys(fields).sort().map(key => `${key}=${fields[key]}`).join('\n');
    return JSON.stringify({ ...fields, hash: createHmac('sha256', createHash('sha256').update(token).digest()).update(text).digest('hex') });
  }
  const fields = { id: 12345, first_name: 'Тест', auth_date: now };
  assert.equal((await verifyTelegramPayload(signed(fields), token, now))?.id, '12345');
  assert.ok(await verifyTelegramPayload(signed({ ...fields, id: '12345', auth_date: String(now) }), token, now));
  for (const payload of [null, {}, '', '{', 'null', '[]', 'true', '123', JSON.stringify({ ...fields, hash: 'x'.repeat(64) }), signed({ ...fields, id: 0 }), signed({ ...fields, first_name: {} }), signed({ ...fields, auth_date: 'NaN' }), signed({ ...fields, auth_date: 'Infinity' }), signed({ ...fields, auth_date: 1.5 }), signed({ ...fields, auth_date: now + 31 }), signed({ ...fields, auth_date: now - 86401 })]) {
    assert.equal(await verifyTelegramPayload(payload, token, now), null);
  }
  assert.ok(await verifyTelegramPayload(signed({ ...fields, auth_date: now + 30 }), token, now));
  assert.ok(await verifyTelegramPayload(signed({ ...fields, auth_date: now - 86400 }), token, now));
  assert.equal(await verifyTelegramPayload(signed(fields).replace('Тест', 'Forged'), token, now), null);
  assert.equal(await verifyTelegramPayload(signed(fields), 'wrong-test-token', now), null);
  console.log('PASS: signed string/numeric fields, malformed JSON/types, hash tampering, identity validation, 24h expiry and 30s skew.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
