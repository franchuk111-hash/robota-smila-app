import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CATEGORY_SEO } from '../lib/seo';

for (const [slug, h1] of [
  ['voditel', 'Робота водієм у Смілі'],
  ['ohorona', 'Робота охоронцем у Смілі'],
] as const) {
  test(`${slug} copy preserves its topic and explains how to compare actual offers`, () => {
    const seo = CATEGORY_SEO[slug];
    assert.equal(seo.h1, h1);
    assert.ok(Array.from(seo.title).length <= 65);
    assert.ok(Array.from(seo.description).length <= 165);
    assert.equal(seo.text.length, 4);
    const copy = [seo.description, ...seo.text].join(' ');
    assert.match(copy, /Telegram/);
    assert.match(copy, /графік/);
    assert.match(copy, /оплат/);
    assert.match(copy, /уточніть|з’ясуйте/);
    assert.match(copy, /оригінальн/);
    assert.doesNotMatch(copy, /\d[\d\s]*\s*грн|гарантован|гідна зарплата|навчання з нуля|спокійна робота|офіційне працевлаштування з першого дня/iu);
  });
}
