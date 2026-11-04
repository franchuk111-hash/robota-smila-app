import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardEmployment } from '../lib/vacancy-card-copy';

test('card employment removes repeats and incomplete eligibility without inventing candidates', () => {
  const format = (schedule: string, typeName = 'Повна зайнятість') => cardEmployment({typeName, schedule});
  assert.equal(format('повна зайнятість. Також готові взяти'), 'Повна зайнятість');
  assert.equal(format('повна зайнятість. Також готові взяти студента, людину з інвалідністю'), 'Повна зайнятість · Також готові взяти студента, людину з інвалідністю');
  assert.equal(format('повна, позмінна'), 'Повна зайнятість · позмінна');
  assert.equal(format('неповна зайнятість. Також готові взяти студента', 'Часткова зайнятість'), 'Часткова зайнятість · Також готові взяти студента');
  assert.equal(format('повна зайнятість, неповна зайнятість', 'Часткова зайнятість'), 'Часткова зайнятість · повна зайнятість');
  assert.equal(format('5/2'), 'Повна зайнятість · 5/2');
});
