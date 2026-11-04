import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { sendVacancyPhoto, vacancyPhotoCaption } from '../lib/telegram-vacancy.ts';
import { renderVacancyCardPNG } from '../lib/vacancy-card.ts';

// Deliberately bounded to this employer-approved submission; never select a feed.
const file = 'data/manual-vacancies.json';
const records = JSON.parse(await readFile(file, 'utf8'));
const matches = records.filter(v => v.slug === 'shvachka-vp-promodiah' && v.company === 'ТОВ «ВП Промодяг»');
assert.equal(matches.length, 1, 'Expected exactly one approved vacancy');
const v = matches[0];
const url = `https://robota-smila.com.ua/vakansiya/${v.id}`;
const refreshCover = process.argv.includes('--refresh-cover');
if (v.tgMsgId && !refreshCover && !process.argv.includes('--preview')) {
  console.log(`Already published: https://t.me/robota_smila_ua/${v.tgMsgId}`);
  process.exit(0);
}
const text = vacancyPhotoCaption(v);
if (process.argv.includes('--preview')) {
  await writeFile('telegram-promodiah-preview.png', await renderVacancyCardPNG(v));
  console.log(text);
  process.exit(0);
}
if (refreshCover) assert.equal(v.tgMsgId, 1411, 'Update only the existing approved post');
// Telegram has no idempotency key. Fail closed on retries after an ambiguous send.
assert.equal(process.env.GITHUB_RUN_ATTEMPT, '1', 'Reconcile the previous receipt before retrying');
assert(process.env.TELEGRAM_BOT_TOKEN, 'Missing Telegram bot credential');
const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
assert.equal(response.status, 200, 'Publish the website vacancy first');
const html = await response.text();
assert(html.includes('Промодяг') && html.includes('+380634064880'), 'Live vacancy does not match');
const messageId = await sendVacancyPhoto(v, process.env.TELEGRAM_BOT_TOKEN, '@robota_smila_ua', {messageId: refreshCover ? v.tgMsgId : undefined});
await writeFile('telegram-promodiah-receipt.json', JSON.stringify({ vacancyId: v.id, messageId, publishedAt: new Date().toISOString() }, null, 2) + '\n');
v.tgMsgId = messageId;
v.tgPostFormat = 'photo';
await writeFile(file, JSON.stringify(records, null, 2) + '\n');
console.log(`Published: https://t.me/robota_smila_ua/${messageId}`);
