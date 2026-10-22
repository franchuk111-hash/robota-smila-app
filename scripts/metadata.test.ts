import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALL_VACANCIES, COMPANIES } from '../lib/data';
import { generateMetadata as vacancyMetadata } from '../app/vakansiya/[id]/page';
import { generateMetadata as companyMetadata } from '../app/kompaniya/[slug]/page';

const siteSuffix = ' | robota-smila';

test('vacancy metadata distinguishes every source record within the title budget', async () => {
  const titles = new Set<string>();
  for (const v of ALL_VACANCIES) {
    const metadata = await vacancyMetadata({ params: Promise.resolve({ id: String(v.id) }) });
    const title = String(metadata.title);
    assert.ok(Array.from(title + siteSuffix).length <= 70, title);
    const peers = ALL_VACANCIES.filter(x => x.title.trim() === v.title.trim());
    if (peers.length === 1 && Array.from(v.title.trim() + ' — Сміла' + siteSuffix).length <= 70) {
      assert.equal(title, `${v.title.trim()} — Сміла`);
      assert.ok(!String(metadata.description).includes(`№${v.id}`));
    }
    assert.ok(!titles.has(title), title);
    titles.add(title);
    if (title.includes(`№${v.id}`)) assert.ok(String(metadata.description).includes(`№${v.id}`));
    assert.equal(metadata.alternates?.canonical, `/vakansiya/${v.id}`);
  }
});

test('company titles remain distinct and concise without changing canonical URLs', async () => {
  const titles = new Set<string>();
  for (const c of COMPANIES) {
    const metadata = await companyMetadata({ params: Promise.resolve({ slug: c.slug }) });
    const title = String(metadata.title);
    assert.ok(Array.from(title + siteSuffix).length <= 70, title);
    assert.ok(!titles.has(title), title);
    titles.add(title);
    assert.equal(metadata.alternates?.canonical, `/kompaniya/${c.slug}`);
  }
});
