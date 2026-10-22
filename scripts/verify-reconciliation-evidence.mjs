import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const manifests = (await readdir('reports')).filter(name => /^data-reconciliation-.*\.json$/.test(name)).sort();
assert.ok(manifests.length, 'Missing reconciliation evidence');
const manifestPath = `reports/${manifests.at(-1)}`;
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const [current, original, html, sitemap] = await Promise.all([
  readFile('data/collected-vacancies.json', 'utf8'),
  readFile(`${manifest.backupDir}/collected-vacancies.before.json`, 'utf8'),
  readFile(`${manifest.backupDir}/catalog.html`, 'utf8'),
  readFile(`${manifest.backupDir}/sitemap.xml`, 'utf8'),
]);
const hash = (text) => createHash('sha256').update(text).digest('hex');
assert.equal(hash(current), manifest.integrity.outputSHA256);
assert.equal(hash(original), manifest.integrity.beforeSHA256);
assert.equal(hash(html), manifest.integrity.catalogSHA256);
assert.equal(hash(sitemap), manifest.integrity.sitemapSHA256);
const data = JSON.parse(current);
const before = JSON.parse(original);
const ids = new Set(data.map(v => v.id));
assert.equal(ids.size, data.length);
assert.equal(data.length, manifest.counts.output);
assert.equal(manifest.sitemapVacancyIds.length, manifest.counts.live);
for (const id of manifest.sitemapVacancyIds) assert.ok(ids.has(id), `Missing live ID ${id}`);
assert.equal(manifest.localOnlyIds.length, manifest.counts.preservedLocalOnly);
for (const id of manifest.localOnlyIds) assert.deepEqual(data.find(v=>v.id===id), before.find(v=>v.id===id));
const flight = [...html.matchAll(/<script>self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)]
  .map(match=>JSON.parse(match[1])).filter(chunk=>chunk[0]===1).map(chunk=>chunk[1]).join('');
const live = flight.split('\n').filter(line=>/^[\da-f]+:\[/.test(line)).flatMap(line=>{
  try { return JSON.parse(line.slice(line.indexOf(':')+1))?.[3]?.vacancies ?? []; } catch { return []; }
});
assert.equal(live.length, manifest.counts.live);
for (const vacancy of live) {
  const restored = data.find(v=>v.id===vacancy.id);
  for (const [key, value] of Object.entries(vacancy)) assert.deepEqual(restored[key], value, `Live field changed: ${vacancy.id}.${key}`);
}
console.log(`PASS reconciliation: ${live.length} live payloads and sitemap IDs preserved, ${manifest.localOnlyIds.length} local-only records unchanged, ${data.length} unique IDs, snapshot/output SHA-256 verified.`);
