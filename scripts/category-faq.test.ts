import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ALL_VACANCIES, type Vacancy } from '../lib/data';
import { categoryFaq } from '../lib/seo';

test('category FAQ keeps unknown experience and absent pay distinct from requirements', () => {
  const vacancy: Vacancy = { ...ALL_VACANCIES[0], salary: [0, 0], short: '', req: [], duties: [], offer: [], schedule: '' };
  const faq = categoryFaq('Тест', [vacancy]);
  assert.match(faq[0].a, /немає оголошень із числовою сумою/);
  assert.match(faq[1].a, /не означає, що всі роботодавці вимагають досвід/);
  assert.doesNotMatch(faq[1].a, /більшість.*потребують/);
  assert.match(categoryFaq('Тест', [])[0].a, /немає оголошень/);
});

test('listed salary amounts do not invent a pay period or market average', () => {
  const vacancy: Vacancy = { ...ALL_VACANCIES[0], salary: [800, 1200], paymentFrequency: 'daily', schedule: 'Денна зміна' };
  const faq = categoryFaq('Тест', [vacancy]);
  assert.doesNotMatch(faq[0].a, /на місяць/);
  assert.match(faq[0].a, /не середня зарплата/);
  assert.match(faq[2].a, /Приклади графіків/);
  assert.doesNotMatch(faq[2].a, /Найчастіше/);
});
