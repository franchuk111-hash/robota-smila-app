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

// Execute the production-parity check itself against controlled server payloads.
// A successful HTTP response must not mask a stale vacancy date or salary.
test('CI postdeploy check rejects stale data and missing catalog payloads', async () => {
  const { runInNewContext } = await import('node:vm');
  const workflow = await readFile(new URL('../.github/workflows/sync-vacancies.yml', import.meta.url), 'utf8');
  const source = /node --import tsx <<'JS'\n([\s\S]*?)\n          JS/.exec(workflow)?.[1].replace(/^          /gm, '');
  assert.ok(source, 'Workflow must contain the executable live data parity check');
  const expected = [{ id: 1, date: '2026-11-03', salary: [22000, 26000], tgMsgId: 123 }];
  const execute = async (rows) => {
    const state = { exitCode: 0, evidence: null };
    const flight = rows === null ? '' : `1:${JSON.stringify(['$', 'Catalog', null, { vacancies: rows }])}\n`;
    const html = `<script>self.__next_f.push(${JSON.stringify([1, flight])})</script>`;
    await runInNewContext(source, {
      require: name => name === 'node:assert/strict' ? assert : name === 'node:fs'
        ? { writeFileSync: (_path, data) => { state.evidence = JSON.parse(data); } }
        : { getActiveVacancies: () => expected },
      fetch: async () => ({ status: 200, text: async () => html }),
      AbortSignal,
      process: { env: { ROBOTA_RELEASE_SHA: 'a'.repeat(40) }, set exitCode(value) { state.exitCode = value; } },
      console: { log() {}, error() {} },
    });
    return state;
  };
  const good = await execute(expected);
  assert.equal(good.exitCode, 0);
  assert.equal(good.evidence.pass, true);
  assert.equal(good.evidence.activeVacancies, 1);
  for (const rows of [null, [], [{ ...expected[0], date: '2026-10-21' }], [{ ...expected[0], salary: [10000, 10000] }]]) {
    const result = await execute(rows);
    assert.equal(result.exitCode, 1, 'Stale or incomplete production data must fail the workflow');
    assert.equal(result.evidence, null);
  }
});
