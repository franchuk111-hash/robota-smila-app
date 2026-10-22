import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

// Replays saved public responses; does not fetch, publish, or call Telegram.
const [catalogPath, sitemapPath] = process.argv.slice(2);
assert.ok(catalogPath && sitemapPath, 'Usage: node scripts/reconcile-live-vacancies.mjs catalog.html sitemap.xml');
const capturedAt = new Date().toISOString();
const stamp = capturedAt.replace(/[:.]/g, '-');
const backupDir = path.join('reports/backups', `data-reconciliation-${stamp}`);
const target = 'data/collected-vacancies.json';
const [html, sitemap, priorText] = await Promise.all([
  readFile(catalogPath, 'utf8'), readFile(sitemapPath, 'utf8'), readFile(target, 'utf8'),
]);
const chunks = [...html.matchAll(/<script>self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)]
  .map((match) => JSON.parse(match[1])).filter((item) => item[0] === 1).map((item) => item[1]);
const flight = chunks.join('');
let live;
for (const line of flight.split('\n')) {
  if (!/^[\da-f]+:\[/.test(line)) continue;
  try {
    const node = JSON.parse(line.slice(line.indexOf(':') + 1));
    if (Array.isArray(node?.[3]?.vacancies)) {
      assert.equal(live, undefined, 'Ambiguous catalog payload');
      live = node[3].vacancies;
    }
  } catch (error) {
    if (error instanceof assert.AssertionError) throw error;
  }
}
assert.ok(live?.length, 'Missing complete catalog payload');
const sitemapIds = [...sitemap.matchAll(/<loc>https:\/\/robota-smila\.com\.ua\/vakansiya\/(\d+)<\/loc>/g)].map((match) => Number(match[1]));
const liveIds = new Set(live.map((vacancy) => vacancy.id));
assert.equal(liveIds.size, live.length, 'Duplicate live vacancy IDs');
assert.equal(new Set(sitemapIds).size, sitemapIds.length, 'Duplicate sitemap IDs');
assert.deepEqual([...liveIds].sort((a,b)=>a-b), [...sitemapIds].sort((a,b)=>a-b), 'Catalog/sitemap ID mismatch');
for (const vacancy of live) {
  assert.ok(Number.isSafeInteger(vacancy.id) && vacancy.id > 0);
  for (const key of ['slug','title','company','cat','catName','type','typeName','schedule','district','date','short']) assert.equal(typeof vacancy[key], 'string', `Invalid ${key} in ${vacancy.id}`);
  assert.equal(typeof vacancy.exp, 'boolean');
  assert.match(vacancy.date, /^\d{4}-\d{2}-\d{2}$/);
  for (const key of ['salary','duties','req','offer']) assert.ok(Array.isArray(vacancy[key]), `Invalid ${key}`);
  if (vacancy.tgMsgId !== undefined) assert.ok(Number.isSafeInteger(vacancy.tgMsgId) && vacancy.tgMsgId > 0);
}
const prior = JSON.parse(priorText);
const sourceKey = (vacancy) => vacancy.source && vacancy.sourceId ? `${vacancy.source}:${vacancy.sourceId}` : undefined;
const byId = new Map(prior.map((vacancy) => [vacancy.id, vacancy]));
const bySource = new Map(prior.filter(sourceKey).map((vacancy) => [sourceKey(vacancy), vacancy]));
const matched = new Set();
const changes = [];
const merged = live.map((vacancy) => {
  const old = byId.get(vacancy.id) ?? bySource.get(sourceKey(vacancy));
  if (old) {
    matched.add(old.id);
    changes.push({ id: vacancy.id, previousId: old.id, changedFields: Object.keys(vacancy).filter((key) => JSON.stringify(old[key]) !== JSON.stringify(vacancy[key])), conflicts: Object.fromEntries(Object.keys(vacancy).filter(key => old[key] !== undefined && JSON.stringify(old[key]) !== JSON.stringify(vacancy[key])).map(key => [key, { previous: old[key], live: vacancy[key] }])) });
  }
  return { ...old, ...vacancy };
});
const localOnly = prior.filter((vacancy) => !matched.has(vacancy.id));
// Absence from the current public snapshot does not prove a vacancy closed.
merged.push(...localOnly);
const output = `${JSON.stringify(merged, null, 2)}\n`;
const hash = (text) => createHash('sha256').update(text).digest('hex');
await mkdir(backupDir, { recursive: true });
await Promise.all([
  writeFile(path.join(backupDir, 'catalog.html'), html),
  writeFile(path.join(backupDir, 'sitemap.xml'), sitemap),
  writeFile(path.join(backupDir, 'collected-vacancies.before.json'), priorText),
  writeFile(path.join(backupDir, 'local-only.archive.json'), `${JSON.stringify(localOnly, null, 2)}\n`),
]);
const manifest = {
  capturedAt, publicSources: ['https://robota-smila.com.ua/vakansii', 'https://robota-smila.com.ua/sitemap.xml'],
  snapshotNote: 'Inputs fetched from public site immediately before this replay; capturedAt is archival processing time.',
  extraction: 'JSON-decoded self.__next_f.push type-1 segments; concatenated Flight payload; catalog vacancies prop.',
  mergePolicy: 'Match id, then source+sourceId; live fields authoritative; retain additional prior fields. Local-only records archived and retained with original dates; normal lifecycle filtering still applies.',
  backupDir, counts: { prior: prior.length, live: live.length, sitemap: sitemapIds.length, matchedPrior: matched.size, addedFromLive: live.length - matched.size, preservedLocalOnly: localOnly.length, archivedLocalOnly: localOnly.length, liveWithoutSource: live.filter(v=>!v.sourceUrl).length, output: merged.length, withTelegramPost: merged.filter(v=>v.tgMsgId).length },
  integrity: { catalogSHA256: hash(html), sitemapSHA256: hash(sitemap), beforeSHA256: hash(priorText), outputSHA256: hash(output), allSitemapIdsPresent: true, livePayloadFieldsUnchanged: live.every((v,i)=>Object.keys(v).every(key=>JSON.stringify(v[key])===JSON.stringify(merged[i][key]))) },
  sitemapVacancyIds: sitemapIds, liveWithoutSourceIds: live.filter(v=>!v.sourceUrl).map(v=>v.id), localOnlyIds: localOnly.map(v=>v.id), matchedChanges: changes,
};
assert.equal(manifest.integrity.livePayloadFieldsUnchanged, true);
await writeFile(target, output);
await writeFile(`reports/data-reconciliation-${stamp}.json`, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ backupDir, ...manifest.counts, ...manifest.integrity }, null, 2));
