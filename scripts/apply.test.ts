import assert from 'node:assert/strict';
import { POST } from '../app/api/apply/route';
async function main() {
const valid = { kind: 'employer', name: 'Test', company: 'Test', phone: '+380991234567', vacancy: '<b>Test</b>', message: 'Description' };
const send = (body: unknown) => POST(new Request('http://localhost/api/apply', { method: 'POST', body: JSON.stringify(body) }));
delete process.env.TELEGRAM_BOT_TOKEN; delete process.env.ADMIN_TELEGRAM_CHAT_ID;
assert.equal((await send(valid)).status, 503);
for (const body of [null, [], { ...valid, phone: 123 }, { ...valid, company: '' }, { ...valid, message: 'x'.repeat(2401) }]) assert.ok((await send(body)).status >= 400);
process.env.TELEGRAM_BOT_TOKEN = 'mock-token'; process.env.ADMIN_TELEGRAM_CHAT_ID = 'mock-chat';
globalThis.fetch = async (_url, init) => {
 const payload = JSON.parse(String(init?.body)); assert.equal(payload.parse_mode, undefined); assert.ok(payload.text.includes('<b>Test</b>')); assert.ok(init?.signal);
 return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
assert.equal((await send(valid)).status, 200);
for (const status of [200, 429, 500]) {
 globalThis.fetch = async () => new Response(JSON.stringify({ ok: false }), { status }); assert.equal((await send(valid)).status, 503);
}
globalThis.fetch = async () => { throw new DOMException('Timeout', 'TimeoutError'); }; const timeout = await send(valid); assert.equal(timeout.status, 504); assert.equal((await timeout.json()).delivery, 'unknown');
globalThis.fetch = async () => new Response('not-json'); assert.equal((await send(valid)).status, 504);
console.log('PASS: validation, missing config, success, Telegram failures, timeout, malformed response; mocked delivery only.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
