import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('CI runtime satisfies the locked deployment CLI minimum', async () => {
  const lock = JSON.parse(await readFile(new URL('../package-lock.json', import.meta.url), 'utf8'));
  const workflow = await readFile(new URL('../.github/workflows/sync-vacancies.yml', import.meta.url), 'utf8');
  const engine = lock.packages['node_modules/wrangler'].engines.node;
  const minimum = /^>=(\d+)/.exec(engine);
  const selected = /node-version:\s*['"]?(\d+)/.exec(workflow);
  assert.ok(minimum && selected, `Review engine contract: ${engine}`);
  assert.ok(Number(selected[1]) >= Number(minimum[1]), `CI Node ${selected[1]} cannot run Wrangler requiring ${engine}`);
});
