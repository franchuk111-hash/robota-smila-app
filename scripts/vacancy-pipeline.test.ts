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

// Source-like salary formats must not let a rounded numeric field override
// a complete textual amount or silently invent a thousand multiplier.
for (const [salarytxt, salary, expected] of [
  ["65 000 грн", 65, [65_000, 65_000]],
  ["65000 грн", 65, [65_000, 65_000]],
  ["20\u00a0000–25\u202f000 грн", 0, [20_000, 25_000]],
  ["від 20 до 25 тис. грн", 0, [20_000, 25_000]],
  ["20–25 тис. грн", 0, [20_000, 25_000]],
  ["25,5 тис. грн", 0, [25_500, 25_500]],
  ["13\u00a0613,20 грн", 13613, [13613.2, 13613.2]],
  ["25 тыс. грн", 0, [25_000, 25_000]],
  ["25k грн", 0, [25_000, 25_000]],
  ["100 грн/годину", 0, [100, 100]],
  ["800–900 грн за зміну", 0, [800, 900]],
  ["20% від продажів + 20 000 грн", 0, [20_000, 20_000]],
  ["від 15000 до 25000 % від особистих продажів", 15000, [15_000, 25_000]],
  ["від 19000 до 22000 1300 за день", 19000, [19_000, 22_000]],
  ["від 20000 до 25000 20000 грн на період випробувального терміну", 20000, [20_000, 25_000]],
  ["1000000 грн", 0, [0, 0]],
  ["65 грн", 65, [65, 65]],
  ["50–80 грн; 20% від фрахту", 65, [65, 65]],
  ["За домовленістю", 0, [0, 0]],
] as const) {
  assert.deepEqual(normalizeRecord({ ...sample, salary, salarytxt }).salary, expected, salarytxt);
}

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
