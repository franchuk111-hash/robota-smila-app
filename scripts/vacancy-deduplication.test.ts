import assert from 'node:assert/strict';
import test from 'node:test';
import { ALL_VACANCIES, getActiveVacancies } from '../lib/data';
import { duplicateVacancyTargets, vacancyFingerprint, VERIFIED_DUPLICATES } from '../lib/vacancy-deduplication';
import { dedupeRecords, normalizeRecord, runPipeline, type SourceVacancy } from './vacancy-pipeline';

const source: SourceVacancy = {
  id0: 1, vacid: 'new', source: 'work.ua', vac_url: 'https://www.work.ua/jobs/1/',
  cityname: 'Сміла', reg_date: new Date().toISOString(), companyname: 'Тест роботодавця',
  vacname: 'Оператор', description: 'Контроль устаткування та виробництво деталей у майстерні.',
  workcond: 'повна', salary: 18000, salarytxt: '18000 грн',
};

test('verified reposts disappear from listings without deleting source records', () => {
  const active = getActiveVacancies(Date.parse('2026-10-23T12:00:00Z'));
  for (const [old, primary] of Object.entries(VERIFIED_DUPLICATES)) {
    assert.ok(ALL_VACANCIES.some(v => v.id === Number(old)));
    assert.ok(!active.some(v => v.id === Number(old)));
    assert.ok(active.some(v => v.id === primary));
  }
  // Different specialties and unresolved salary differences must survive.
  for (const id of [1080891185, 1657189048, 1220850666, 1418616328, 1272355178]) {
    assert.ok(active.some(v => v.id === id), String(id));
  }
});

test('content identity ignores IDs/date but preserves different terms', () => {
  const a = normalizeRecord(source);
  const b = { ...a, id: a.id + 1, sourceId: 'reposted', date: '2026-10-24' };
  assert.equal(vacancyFingerprint(a), vacancyFingerprint(b));
  assert.equal(duplicateVacancyTargets([a, b]).get(a.id), b.id);
  for (const changed of [{ salary: [19000, 19000] as [number, number] }, { district: 'Інша адреса' },
    { duties: ['Інші обов’язки'] }, { title: 'Інша спеціальність' }, { schedule: 'нічна' }]) {
    assert.notEqual(vacancyFingerprint(a), vacancyFingerprint({ ...a, ...changed }));
  }
  assert.equal(dedupeRecords([source, { ...source, vacid: 'repost' }]).length, 1);
  assert.equal(dedupeRecords([source, { ...source, vacid: 'different', salary: 19000, salarytxt: '19000 грн' }]).length, 2);
  assert.equal(vacancyFingerprint({ ...a, company: 'Роботодавець не вказаний' }), undefined);
});

test('import checks accumulated content before sending or saving', async () => {
  const token = process.env.TELEGRAM_BOT_TOKEN, channel = process.env.TELEGRAM_CHANNEL_ID;
  process.env.TELEGRAM_BOT_TOKEN = 'test'; process.env.TELEGRAM_CHANNEL_ID = 'test';
  let writes = 0, sends = 0;
  try {
    await runPipeline({}, {
      collect: async () => [{ ...source, vacid: 'repost' }],
      loadPublished: () => [normalizeRecord(source)],
      savePublished: () => { writes++; }, updateTelegram: async () => { sends++; },
      sendToTelegram: async () => { sends++; return 1; },
    });
    assert.equal(writes, 0); assert.equal(sends, 0);
    const existing = { ...normalizeRecord(source), date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), tgMsgId: 7 };
    await runPipeline({}, {
      collect: async () => [{ ...source, vacid: 'fresh-repost' }],
      loadPublished: () => [existing],
      savePublished: records => {
        writes++;
        assert.equal(records[0].id, existing.id);
        assert.equal(records[0].tgMsgId, 7);
        assert.equal(records[0].date, source.reg_date.slice(0, 10));
        assert.equal(records[0].repostSources?.[0].sourceId, 'fresh-repost');
      },
      updateTelegram: async () => { sends++; }, sendToTelegram: async () => { sends++; return 1; },
    });
    assert.equal(writes, 1); assert.equal(sends, 0);
  } finally {
    if (token === undefined) delete process.env.TELEGRAM_BOT_TOKEN; else process.env.TELEGRAM_BOT_TOKEN = token;
    if (channel === undefined) delete process.env.TELEGRAM_CHANNEL_ID; else process.env.TELEGRAM_CHANNEL_ID = channel;
  }
});
