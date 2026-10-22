import assert from "node:assert/strict";
import { cleanText, dedupeRecords, formatTelegramVacancy, normalizeRecord, type SourceVacancy } from "./vacancy-pipeline";

const sample: SourceVacancy = {
  id0: 1,
  reg_date: "2026-09-24T10:00:00.000Z",
  cityname: "Сміла",
  companyname: "Тест, ТОВ",
  vacname: "Продавець-консультант",
  description: "<p>Робота у магазині.</p><p>Без досвіду роботи.</p>",
  workcond: "повна",
  salary: 20_000,
  salarytxt: "від 20 000 до 25 000 грн",
  branchnname: "торгівля",
  vacid: "42",
  vac_url: "https://example.com/job/42",
  source: "work.ua",
};

assert.equal(cleanText("<p>Один&nbsp;рядок</p><p>Другий</p>"), "Один рядок\nДругий");
assert.equal(dedupeRecords([sample, sample, { ...sample, cityname: "Черкаси", vacid: "43" }]).length, 1);
const vacancy = normalizeRecord(sample);
assert.deepEqual(vacancy.salary, [20_000, 25_000]);
assert.equal(vacancy.cat, "prodavets");
assert.equal(vacancy.exp, false);
assert.match(formatTelegramVacancy(vacancy), /Підписатися[\s\S]+Відгукнутися[\s\S]+Джерело: work\.ua/);
assert.ok(formatTelegramVacancy(vacancy).length < 4096);
const repeated = "Робота у магазині з покупцями та товаром.";
const message = formatTelegramVacancy({ ...vacancy, short: repeated, duties: [repeated] });
assert.equal(message.split(repeated).length - 1, 1);
assert.ok(message.length < 800);
const abbreviation = normalizeRecord({ ...sample, description: "Потрібен водій кат. B для доставки товарів." });
assert.equal(abbreviation.duties[0], "Потрібен водій кат. B для доставки товарів.");
console.log("vacancy-pipeline: ok");

assert.equal(normalizeRecord({ ...sample, description: 'Досвід не обов’язковий' }).exp, false);
assert.deepEqual(normalizeRecord({ ...sample, salary: 0, salarytxt: '20 000 25 000 грн' }).salary, [20_000, 25_000]);
assert.deepEqual(normalizeRecord({ ...sample, salary: 0, salarytxt: '20 000–25 000 грн' }).salary, [20_000, 25_000]);

async function testDryRunRefresh() {
  const { runPipeline } = await import('./vacancy-pipeline');
  let writes = 0;
  let sends = 0;
  await runPipeline({ dryRun: true, refresh: true }, {
    collect: async () => [sample],
    loadPublished: () => [{ ...vacancy, tgMsgId: 7 }],
    savePublished: () => { writes++; },
    updateTelegram: async () => { sends++; },
    sendToTelegram: async () => { sends++; return 1; },
  });
  assert.equal(writes, 0);
  assert.equal(sends, 0);
  const previousToken = process.env.TELEGRAM_BOT_TOKEN;
  const previousChannel = process.env.TELEGRAM_CHANNEL_ID;
  process.env.TELEGRAM_BOT_TOKEN = 'mock-token';
  process.env.TELEGRAM_CHANNEL_ID = 'mock-channel';
  try {
    const historical = { ...vacancy, id: 999, sourceId: 'historical' };
    await runPipeline({ refresh: true }, {
      collect: async () => [sample],
      loadPublished: () => [{ ...vacancy, hot: true, validThrough: '2026-12-01' }, historical],
      savePublished: records => {
        assert.equal(records.length, 2);
        assert.equal(records[0].hot, true);
        assert.equal(records[0].validThrough, '2026-12-01');
        assert.equal(records[1], historical);
      },
      updateTelegram: async () => { throw new Error('No messages should be updated'); },
      sendToTelegram: async () => { throw new Error('No messages should be sent'); },
    });
  } finally {
    if (previousToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN; else process.env.TELEGRAM_BOT_TOKEN = previousToken;
    if (previousChannel === undefined) delete process.env.TELEGRAM_CHANNEL_ID; else process.env.TELEGRAM_CHANNEL_ID = previousChannel;
  }
  console.log('vacancy-pipeline: dry-run refresh read-only; refresh preserves metadata and history');
}
testDryRunRefresh().catch(error => { console.error(error); process.exitCode = 1; });
