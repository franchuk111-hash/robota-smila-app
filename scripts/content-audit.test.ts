import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { ARTICLES, ALL_VACANCIES } from '../lib/data';
import { CATEGORY_SEO, LANDINGS, LANDING_FAQ } from '../lib/seo';

test('category and intent copy does not invent salary ranges or response deadlines', () => {
  const copy = JSON.stringify([CATEGORY_SEO, LANDINGS, LANDING_FAQ]);
  assert.doesNotMatch(copy, /\d[\d\s]*[–-]\d[\d\s]*\s*грн|передзвонюють протягом|гроші вже сьогодні|заявка одразу надходить/iu);
  for (const page of LANDINGS) assert.ok(LANDING_FAQ[page.slug]?.length);
});
test('daily-pay intent remains strict and copy distinguishes weekly payments', () => {
  const page = LANDINGS.find(p => p.slug === 'robota-z-shchodennoyu-oplatoyu')!;
  const sample = ALL_VACANCIES[0];
  assert.equal(page.filter({ ...sample, paymentFrequency: 'daily' }), true);
  assert.equal(page.filter({ ...sample, paymentFrequency: 'weekly' }), false);
  assert.match(page.text.join(' '), /Щотижневі виплати.*не прирівнюємо/);
});
test('salary, employer and daily-pay guides preserve URLs without unsupported endorsements', () => {
  for (const slug of ['serednya-zarplata-smila-2026','top-robotodavtsiv-smily','robota-z-schodennoyu-oplatoyu']) {
    const article = ARTICLES.find(a => a.slug === slug)!;
    assert.ok(article);
    assert.doesNotMatch(article.body.join(' '), /\d[\d\s]*[–-]\d[\d\s]*\s*грн|без ризику|Немає лікарняних|вчасно платять/iu);
    assert.ok(article.body.some(p => p.includes('href=')));
    assert.ok(article.date < '2026-11-03', 'original publication date stays intact');
    assert.equal(article.dateModified, '2026-11-03');
  }
});
test('resume example is explicitly fictional and cannot expose usable sample contact details', () => {
  const html = readFileSync('app/rezume/page.tsx','utf8');
  assert.match(html, /усі дані вигадані/);
  assert.match(html, /name@example.com/);
  assert.doesNotMatch(html, /123-45-67|Довше — не читають|найвищий показник ввічливості/);
});

 test('sitemap refreshes only edited content and preserves untouched dates', async () => {
  const sitemap = (await import('../app/sitemap')).default();
  const get = (path: string) => sitemap.find(p => p.url === `https://robota-smila.com.ua${path}`);
  assert.equal(get('/blog')?.lastModified, '2026-11-03');
  assert.equal(get('/blog/serednya-zarplata-smila-2026')?.lastModified, '2026-11-03');
  assert.equal(get('/blog/robota-bez-dosvidu-smila')?.lastModified, '2026-06-20');
  assert.equal(get('/kalendar')?.lastModified, '2026-11-05');
  assert.equal(get('/vakansii/voditel')?.lastModified, '2026-11-05');
});

test('salary tool copy discloses sample limitations without invented pay bands', () => {
  const html = readFileSync('app/zarplatomir/page.tsx','utf8');
  assert.match(html, /не представляє весь ринок/);
  assert.match(html, /середні нижню та верхню/);
  assert.match(html, /годину, зміну, місяць/);
  assert.doesNotMatch(html, /15 000|35 000|живу картину ринку|оплачуються вище/);
});

test('salary category select has its visible label associated', () => {
  const html = readFileSync('components/Zarplatomir.tsx', 'utf8');
  assert.match(html, /htmlFor="salary-category"/);
  assert.match(html, /select id="salary-category"/);
});
