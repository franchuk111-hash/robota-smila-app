import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const script = fileURLToPath(new URL('./reconcile-live-vacancies.mjs', import.meta.url));
const root = await mkdtemp(path.join(tmpdir(), 'robota-reconcile-test-'));
const vacancy = (id, extra = {}) => ({
  id, slug: `vacancy-${id}`, title: `Вакансія ${id}`, company: 'Роботодавець',
  cat: 'office', catName: 'Офіс', type: 'FULL_TIME', typeName: 'Повна зайнятість',
  schedule: 'Позмінно', district: 'Сміла', date: '2026-10-20', short: 'Опис вакансії',
  exp: false, salary: [0, 0], duties: [], req: [], offer: [], ...extra,
});
try {
  await mkdir(path.join(root, 'data'));
  const localOnly = vacancy(3, { source: 'local', sourceId: 'kept' });
  const prior = [vacancy(1, { title: 'Стара назва', internalNote: 'preserved' }), vacancy(20, { source: 'work', sourceId: 'same-source', tgMsgId: 70 }), localOnly];
  const live = [vacancy(1, { title: 'Актуальна назва' }), vacancy(2, { source: 'work', sourceId: 'same-source' }), vacancy(4, { tgMsgId: 80 })];
  const before = `${JSON.stringify(prior, null, 2)}\n`;
  const flight = `a:${JSON.stringify(['$', 'Catalog', null, { vacancies: live }])}\n`;
  const html = `<script>self.__next_f.push(${JSON.stringify([1, flight.slice(0, 37)])})</script><script>self.__next_f.push(${JSON.stringify([1, flight.slice(37)])})</script>`;
  const sitemap = `<urlset>${live.map(v => `<url><loc>https://robota-smila.com.ua/vakansiya/${v.id}</loc></url>`).join('')}</urlset>`;
  await Promise.all([
    writeFile(path.join(root, 'data/collected-vacancies.json'), before),
    writeFile(path.join(root, 'catalog.html'), html), writeFile(path.join(root, 'sitemap.xml'), sitemap),
  ]);
  execFileSync(process.execPath, [script, 'catalog.html', 'sitemap.xml'], { cwd: root, stdio: 'pipe' });
  const output = await readFile(path.join(root, 'data/collected-vacancies.json'), 'utf8');
  const data = JSON.parse(output);
  assert.deepEqual(data.map(v => v.id), [1, 2, 4, 3]);
  assert.equal(data[0].title, 'Актуальна назва');
  assert.equal(data[0].internalNote, 'preserved');
  assert.equal(data[1].tgMsgId, 70, 'source identity retains local metadata when live ID changes');
  assert.deepEqual(data[3], localOnly);
  for (const [index, v] of live.entries()) for (const [key, value] of Object.entries(v)) assert.deepEqual(data[index][key], value);
  const manifestName = (await readdir(path.join(root, 'reports'))).find(name => /^data-reconciliation-.*\.json$/.test(name));
  const manifest = JSON.parse(await readFile(path.join(root, 'reports', manifestName), 'utf8'));
  const hash = text => createHash('sha256').update(text).digest('hex');
  assert.equal(manifest.integrity.outputSHA256, hash(output));
  assert.equal(manifest.integrity.beforeSHA256, hash(before));
  assert.equal(manifest.integrity.catalogSHA256, hash(html));
  assert.equal(manifest.integrity.sitemapSHA256, hash(sitemap));
  assert.equal(manifest.counts.output, 4);
  assert.equal(manifest.counts.preservedLocalOnly, 1);
  assert.deepEqual(manifest.localOnlyIds, [3]);
  assert.equal(await readFile(path.join(root, manifest.backupDir, 'collected-vacancies.before.json'), 'utf8'), before);
  await writeFile(path.join(root, 'sitemap.xml'), '<urlset></urlset>');
  assert.throws(() => execFileSync(process.execPath, [script, 'catalog.html', 'sitemap.xml'], { cwd: root, stdio: 'pipe' }), /Command failed/);
  assert.equal(await readFile(path.join(root, 'data/collected-vacancies.json'), 'utf8'), output, 'invalid snapshot cannot mutate data');
  console.log('PASS reconciliation: live precedence, source matching, local-only preservation, backups, hashes and invalid-snapshot rejection.');
} finally {
  await rm(root, { recursive: true, force: true });
}
