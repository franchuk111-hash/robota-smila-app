import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { getActiveVacancies } from '../lib/data.ts';
(async () => {
  const response = await fetch('https://robota-smila.com.ua/vakansii', { signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200);
  const html = await response.text();
  const flight = [...html.matchAll(/<script>self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)]
    .map(match => JSON.parse(match[1])).filter(item => item[0] === 1).map(item => item[1]).join('');
  const payloads = [];
  // React Flight can inline the client element inside a parent model row.
  const collect = (value) => {
    if (!value || typeof value !== 'object') return;
    if (!Array.isArray(value) && Array.isArray(value.vacancies)) payloads.push(value.vacancies);
    for (const child of Object.values(value)) collect(child);
  };
  for (const line of flight.split('\n')) {
    if (!/^[\da-f]+:\[/.test(line)) continue;
    try {
      const item = JSON.parse(line.slice(line.indexOf(':') + 1));
      collect(item);
    } catch {}
  }
  assert.equal(payloads.length, 1, 'Complete live catalog payload is required');
  const sort = rows => [...rows].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  assert.deepEqual(sort(payloads[0]), sort(JSON.parse(JSON.stringify(getActiveVacancies()))), 'Published vacancy facts differ from the release');
  const result = { checkedAt: new Date().toISOString(), pass: true, sourceSha: process.env.ROBOTA_RELEASE_SHA, activeVacancies: payloads[0].length };
  writeFileSync('reports/live-vacancy-parity.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
})().catch(error => { console.error(error); process.exitCode = 1; });
