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
