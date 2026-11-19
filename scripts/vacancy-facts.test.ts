import assert from 'node:assert/strict';
import { ALL_VACANCIES, getActiveCompanies, getActiveVacancies } from '../lib/data';
import { experienceStatus, experienceLabel, vacancyLocation, canPublishJobPosting, salaryStatistics } from '../lib/vacancy-facts';
import { vacancyFaq } from '../lib/seo';
const sample = { ...ALL_VACANCIES[0], short: 'Робота в магазині', req: [], duties: [], offer: [], exp: false };
assert.equal(experienceStatus(sample), 'unknown');
assert.equal(experienceStatus({ ...sample, req: ['Без досвіду'] }), 'not-required');
assert.equal(experienceStatus({ ...sample, req: ['Досвід роботи від 3 років'] }), 'required');
assert.ok(!experienceLabel({ ...sample, req: ['Досвід роботи від 3 років'] }).includes('1 року'));
assert.ok(!vacancyFaq(sample)[2].a.includes('навчати'));
const elsewhere = { ...sample, short: 'Робота проводиться на будівельній площадці у Канівському районі', sourceUrl: 'https://www.work.ua/jobs/123/' };
assert.equal(vacancyLocation(elsewhere), 'Канівський район');
assert.equal(canPublishJobPosting(elsewhere), false);
assert.equal(canPublishJobPosting({ ...sample, sourceUrl: 'https://www.work.ua/jobs/123/' }), false);
assert.equal(canPublishJobPosting({ ...sample, short: 'Локація: м. Сміла', sourceUrl: 'https://www.work.ua/jobs/123/' }), true);
assert.equal(salaryStatistics([{ ...sample, salary: [0, 0] }]), null);
assert.deepEqual(salaryStatistics([{ ...sample, salary: [10000, 20000] }, { ...sample, salary: [0, 0] }]), { count: 1, avgMin: 10000, avgMax: 20000, mid: 15000 });
const now = Date.parse('2026-10-21T12:00:00+03:00');
const active = getActiveVacancies(now);
assert.ok(getActiveCompanies(now).every(c => active.some(v => v.company === c.name)));
console.log('PASS vacancy facts: unknown experience, truthful FAQ, location guard, paid salary sample, active employers');

assert.equal(canPublishJobPosting({ ...sample, short: 'Забираємо працівників у Смілі. Офіс у Смілі.' }), false);
const guard = ALL_VACANCIES.find(v => v.id === 1811853370)!;
assert.equal(vacancyLocation({ ...guard, date: '2026-11-17' }), 'Черкаси');
assert.equal(canPublishJobPosting({ ...guard, date: '2026-11-17' }), true);
assert.equal(canPublishJobPosting({ ...guard, date: '2026-11-20' }), false);
assert.equal(canPublishJobPosting({ ...guard, short: 'Місце роботи: Київ' }), false);
assert.equal(canPublishJobPosting({ ...guard, title: 'Нова посада' }), false);
for (const id of [1043034239, 1613796198, 1495690181]) {
  assert.equal(vacancyLocation({ ...ALL_VACANCIES.find(v => v.id === id)!, date: '2026-11-13' }), 'Балаклея');
}
