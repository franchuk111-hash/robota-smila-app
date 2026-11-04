import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Deliberately bounded to this employer-approved submission; never select a feed.
const file = 'data/manual-vacancies.json';
const records = JSON.parse(await readFile(file, 'utf8'));
const matches = records.filter(v => v.slug === 'shvachka-vp-promodiah' && v.company === 'ТОВ «ВП Промодяг»');
assert.equal(matches.length, 1, 'Expected exactly one approved vacancy');
const v = matches[0];
const url = `https://robota-smila.com.ua/vakansiya/${v.id}`;
if (v.tgMsgId) {
  console.log(`Already published: https://t.me/robota_smila_ua/${v.tgMsgId}`);
  process.exit(0);
}
const text = [
  `🧵 ${v.title} — ${v.company}`, '💰 15 000–30 000 грн', '', v.short,
  '', 'Вимоги:', ...v.req.map(x => `• ${x}`),
  '', 'Ми пропонуємо:', ...v.offer.map(x => `• ${x}`),
  '', '📞 +380634064880', 'Місце роботи та вид зайнятості уточнюйте у роботодавця.', '', url,
].join('\n');
assert(text.length < 4096);
if (process.argv.includes('--preview')) {
  console.log(text);
  process.exit(0);
}
// Telegram has no idempotency key. Fail closed on retries after an ambiguous send.
assert.equal(process.env.GITHUB_RUN_ATTEMPT, '1', 'Reconcile the previous receipt before retrying');
assert(process.env.TELEGRAM_BOT_TOKEN, 'Missing Telegram bot credential');
const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
assert.equal(response.status, 200, 'Publish the website vacancy first');
const html = await response.text();
assert(html.includes('Промодяг') && html.includes('+380634064880'), 'Live vacancy does not match');
const result = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ chat_id: '@robota_smila_ua', text, link_preview_options: { is_disabled: true } }),
  signal: AbortSignal.timeout(30000),
}).then(r => r.json());
assert(result.ok && Number.isInteger(result.result?.message_id), 'Telegram did not confirm publication');
const messageId = result.result.message_id;
await writeFile('telegram-promodiah-receipt.json', JSON.stringify({ vacancyId: v.id, messageId, publishedAt: new Date().toISOString() }, null, 2) + '\n');
v.tgMsgId = messageId;
await writeFile(file, JSON.stringify(records, null, 2) + '\n');
console.log(`Published: https://t.me/robota_smila_ua/${messageId}`);
