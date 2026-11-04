import test from 'node:test';
import assert from 'node:assert/strict';
import { salaryStatistics } from '../lib/vacancy-facts';
import { ALL_VACANCIES, salaryFmt } from '../lib/data';
test('equal salary bounds render once while ranges and negotiable pay retain their meaning', () => {
  const amount = (n: number) => n.toLocaleString('uk-UA');
  assert.equal(salaryFmt([15000,15000]), `${amount(15000)} ₴`);
  assert.equal(salaryFmt([15000,25000]), `${amount(15000)} – ${amount(25000)} ₴`);
  assert.equal(salaryFmt([0,0]), 'Договірна');
  for (const v of ALL_VACANCIES) {
    if (v.salary[0] === v.salary[1] && v.salary[0] > 0) assert.equal(salaryFmt(v.salary), `${amount(v.salary[0])} ₴`, String(v.id));
  }
});

test('salary averages retain observed endpoints without inventing a range for small samples', () => {
  const vacancy = ALL_VACANCIES[0];
  const equal = salaryStatistics([{ ...vacancy, salary: [15000, 15000] }]);
  assert.deepEqual(equal, { count: 1, avgMin: 15000, avgMax: 15000, mid: 15000 });
  assert.equal(salaryFmt([equal!.avgMin, equal!.avgMax]), `${(15000).toLocaleString('uk-UA')} ₴`);
  const range = salaryStatistics([{ ...vacancy, salary: [10000, 20000] }, { ...vacancy, salary: [20000, 30000] }, { ...vacancy, salary: [0, 0] }]);
  assert.deepEqual(range, { count: 2, avgMin: 15000, avgMax: 25000, mid: 20000 });
});
