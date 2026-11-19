import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALL_VACANCIES } from '../lib/data';
import { commonWorkplace } from '../lib/company-workplace';

test('company location describes all advertised roles only when they share a verified workplace', () => {
  const sample = { ...ALL_VACANCIES[0], sourceUrl: 'https://www.work.ua/jobs/123/', short: 'Локація: м. Сміла', duties: [] };
  const unknown = { ...sample, short: 'Забираємо кандидатів у Смілі.' };
  assert.equal(commonWorkplace([sample, sample]), 'Сміла');
  assert.equal(commonWorkplace([sample, unknown]), undefined);
  assert.equal(commonWorkplace([unknown]), undefined);
  assert.equal(commonWorkplace([]), undefined);
});
