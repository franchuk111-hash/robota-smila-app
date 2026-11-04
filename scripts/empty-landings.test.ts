import test from 'node:test';
import assert from 'node:assert/strict';
import sitemap from '../app/sitemap';
import { getActiveVacancies } from '../lib/data';
import { LANDINGS } from '../lib/seo';
import { generateMetadata as daily } from '../app/robota-z-shchodennoyu-oplatoyu/page';
import { generateMetadata as noExperience } from '../app/robota-bez-dosvidu/page';
import { generateMetadata as partTime } from '../app/pidrobitok/page';
import { generateMetadata as students } from '../app/robota-dlya-studentiv/page';
import { generateMetadata as urgent } from '../app/terminovi-vakansii/page';

const metadata = new Map([
  ['robota-z-shchodennoyu-oplatoyu', daily], ['robota-bez-dosvidu', noExperience],
  ['pidrobitok', partTime], ['robota-dlya-studentiv', students], ['terminovi-vakansii', urgent],
]);

test('landing indexing and sitemap inclusion follow actual matching active vacancies', () => {
  const vacancies = getActiveVacancies();
  const paths = new Set(sitemap().map(entry => new URL(entry.url).pathname));
  for (const landing of LANDINGS) {
    const hasJobs = vacancies.some(landing.filter);
    const meta = metadata.get(landing.slug)!();
    assert.equal(paths.has(`/${landing.slug}`), hasJobs, landing.slug);
    assert.deepEqual(meta.robots, hasJobs ? undefined : { index: false, follow: true }, landing.slug);
    assert.equal(meta.alternates?.canonical, `/${landing.slug}`);
  }
  assert.ok(paths.has('/vakansii'));
  assert.ok(paths.has('/zarplatomir'));
});
