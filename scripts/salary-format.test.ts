import test from 'node:test';
import assert from 'node:assert/strict';
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
