import { applyVerifiedSourceCorrections } from "../lib/vacancy-source-corrections";
import { inferRequiredExperience } from "../lib/vacancy-experience";
import { vacancyFingerprint } from "../lib/vacancy-deduplication";
import { isListedVacancy } from "../lib/vacancy-lifecycle";
import { vacancyCategory } from "../lib/vacancy-category";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Vacancy } from "../lib/data";

const API_URL = "https://dczworknowbot.dcz.gov.ua:334/api/vac/vacancies/sort";
const CITY_ID = "UA71080390"; // Смілянська міська громада
const DATA_FILE = path.resolve("data/collected-vacancies.json");
const CHANNEL = "robota_smila_ua";
const SOURCES = new Set(["dcz", "work.ua", "rabota.ua"]);

export type SourceVacancy = {
  id0: number;
  reg_date: string;
  cityname: string;
  companyname: string;
  vacname: string;
  description: string;
  workcond?: string | null;
  salary?: number | null;
  salarytxt?: string | null;
  branchnname?: string | null;
  vacid: string;
  vac_url: string;
  source: string;
};

type ApiResponse = {
  status: boolean;
  data: SourceVacancy[];
  totalPages: number;
};

const htmlEntities: Record<string, string> = {
  "&nbsp;": " ", "&amp;": "&", "&quot;": '"', "&#39;": "'", "&lt;": "<", "&gt;": ">",
};

export function cleanText(html: string): string {
  return html
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/(p|li|div|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(nbsp|amp|quot|#39|lt|gt);/g, (entity) => htmlEntities[entity] ?? entity)
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}


function stableId(value: string): number {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return 1_000_000_000 + (hash >>> 0) % 900_000_000;
}

function salaryRange(record: SourceVacancy): [number, number] {
  // Some feeds supply a rounded numeric average (65) alongside the full
  // advertised amount (65 000). Prefer explicit amounts in the source text.
  const thousand = String.raw`(?:тис(?:яч[аіу]?)?\.?|тыс(?:яч[аиу]?)?\.?|k)(?=\s|грн|₴|$)`;
  const decimal = String.raw`\d+(?:[.,]\d+)?`;
  const text = cleanText(record.salarytxt ?? "")
    .replace(new RegExp(`(${decimal})\\s*(–|—|−|-|до)\\s*(${decimal})\\s*${thousand}`, "gi"),
      (_, lower: string, separator: string, upper: string) =>
        `${Number(lower.replace(",", ".")) * 1_000}${separator}${Number(upper.replace(",", ".")) * 1_000}`)
    .replace(new RegExp(`(${decimal})\\s*${thousand}`, "gi"),
      (_, amount: string) => String(Number(amount.replace(",", ".")) * 1_000));
  const explicitShortPeriod = /(?:за|на|\/)\s*(?:год(?:ину|ина|ини|ин)?|час|день|доба|добу|змін[ау])|(?:грн|₴)\s*(?:год|час|день|доба|добу|змін)/i.test(text);
  const values = [...text.matchAll(/\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?/g)]
    .filter(match => Number(match[0].replace(/\s/g, "")) > 100 || !/^\s*%/.test(text.slice((match.index ?? 0) + match[0].length)))
    .map(match => Number(match[0].replace(/\s/g, "").replace(",", ".")))
    .filter(value => value > 0 && value <= 500_000 && (value >= 1_000 || explicitShortPeriod))
    .slice(0, 2);
  if (values.length === 2) return [Math.min(...values), Math.max(...values)];
  if (values.length === 1) return [values[0], values[0]];
  const salary = Number(record.salary);
  return Number.isFinite(salary) && salary > 0 ? [salary, salary] : [0, 0];
}


export function normalizeRecord(record: SourceVacancy): Vacancy {
  const sourceKey = `${record.source}:${record.vacid}`;
  const description = cleanText(record.description);
  const details = description
    .split(/\n+/)
    .map((part) => part.trim())
    .filter((part) => part.length >= 20)
    .slice(0, 20);
  const work = record.workcond?.trim() || "Умови в описі";
  const isPartTime = /неповн|частков/i.test(work);
  const hasExperience = inferRequiredExperience(description) ?? false;

  return applyVerifiedSourceCorrections({
    id: stableId(sourceKey),
    slug: `${record.source.replace(/\W+/g, "-")}-${record.vacid}`,
    title: record.vacname.trim(),
    company: record.companyname.trim() || "Роботодавець не вказаний",
    salary: salaryRange(record),
    ...vacancyCategory(record.vacname, record.branchnname ?? ""),
    type: isPartTime ? "PART_TIME" : "FULL_TIME",
    typeName: isPartTime ? "Часткова зайнятість" : "Повна зайнятість",
    schedule: work,
    district: "Сміла",
    exp: hasExperience,
    date: record.reg_date.slice(0, 10),
    short: description.slice(0, 480),
    duties: details,
    req: [],
    offer: [],
    source: record.source,
    sourceUrl: record.vac_url,
    sourceId: record.vacid,
  });
}

export function dedupeRecords(records: SourceVacancy[]): SourceVacancy[] {
  const exact = new Map<string, SourceVacancy>();
  for (const record of records) {
    if (!SOURCES.has(record.source) || record.cityname !== "Сміла") continue;
    exact.set(`${record.source}:${record.vacid}`, record);
  }

  const crossSource = new Map<string, SourceVacancy>();
  for (const record of [...exact.values()].sort((a, b) => b.reg_date.localeCompare(a.reg_date))) {
    const key = vacancyFingerprint(normalizeRecord(record)) ?? `${record.source}:${record.vacid}`;
    if (!crossSource.has(key)) crossSource.set(key, record);
  }
  return [...crossSource.values()];
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function salaryText(vacancy: Vacancy): string {
  const [min, max] = vacancy.salary;
  if (!min && !max) return "Договірна";
  if (min === max) return `${min.toLocaleString("uk-UA")} грн`;
  return `${min.toLocaleString("uk-UA")}–${max.toLocaleString("uk-UA")} грн`;
}

function clipText(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : value;
}

function telegramSummary(vacancy: Vacancy): string {
  const actions = vacancy.duties.filter((item) => /^(?:[-•]\s*)?(?:налагод|викон|контрол|оброб|спілку|підготов|організ|продаж|допом|підтрим|пригот|перевоз|розвоз|достав|дотрим|забезпеч)/i.test(item));
  if (actions.length >= 2) return actions.slice(0, 3).map((item) => `• ${clipText(item.replace(/^[-•]\s*/, ""), 110)}`).join("\n");
  return clipText(vacancy.short, 260);
}

export function formatTelegramVacancy(vacancy: Vacancy): string {
  const sourceName = vacancy.source === "dcz" ? "Державна служба зайнятості" : vacancy.source;
  const description = telegramSummary(vacancy);
  return [
    `💼 <b>${escapeHtml(vacancy.title)}</b>`,
    `🏢 ${escapeHtml(vacancy.company)}`,
    `💰 ${escapeHtml(salaryText(vacancy))}`,
    `📍 Сміла`,
    `🕒 ${escapeHtml(vacancy.schedule)}`,
    "",
    escapeHtml(description),
    "",
    `📢 <b><a href="https://t.me/${CHANNEL}">Підписатися на нові вакансії Сміли</a></b>`,
    "",
    `✅ <a href="${escapeHtml(vacancy.sourceUrl ?? "")}">Відгукнутися на вакансію</a>`,
    `Джерело: ${escapeHtml(sourceName ?? "")}`,
  ].join("\n");
}

async function fetchPage(page: number): Promise<ApiResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://www.dcz.gov.ua" },
    body: JSON.stringify({
      search: "", otrasl: "", cityid: CITY_ID, page, salary: null, workcondsm: "",
      sortColumn: "reg_date", sortOrder: "DESC", filterInvalid: false,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`DCZ API ${response.status}`);
  return response.json() as Promise<ApiResponse>;
}

async function collect(): Promise<SourceVacancy[]> {
  const first = await fetchPage(1);
  if (!first.status) throw new Error("DCZ API returned status=false");
  const totalPages = Math.min(first.totalPages, 50);
  const rest: SourceVacancy[] = [];
  for (let page = 2; page <= totalPages; page++) rest.push(...(await fetchPage(page)).data);
  return dedupeRecords([...first.data, ...rest]);
}

async function sendToTelegram(vacancy: Vacancy, token: string, chatId: string): Promise<number> {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: formatTelegramVacancy(vacancy),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const result = await response.json() as { ok: boolean; description?: string; result?: { message_id: number } };
  if (!response.ok || !result.ok || !result.result) throw new Error(result.description || `Telegram API ${response.status}`);
  return result.result.message_id;
}

async function updateTelegram(vacancy: Vacancy, token: string, chatId: string): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: vacancy.tgMsgId,
      text: formatTelegramVacancy(vacancy),
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
    signal: AbortSignal.timeout(20_000),
  });
  const result = await response.json() as { ok: boolean; description?: string };
  if (result.description?.includes("message is not modified")) return;
  if (!response.ok || !result.ok) throw new Error(result.description || `Telegram API ${response.status}`);
}

function loadPublished(): Vacancy[] {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8")) as Vacancy[];
}

function savePublished(vacancies: Vacancy[]): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(vacancies, null, 2)}\n`);
}

export async function runPipeline(
  { dryRun = false, refresh = false } = {},
  operations = { collect, loadPublished, savePublished, updateTelegram, sendToTelegram },
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!dryRun && (!token || !chatId)) throw new Error("TELEGRAM_BOT_TOKEN and TELEGRAM_CHANNEL_ID are required");

  if (refresh) {
    const current = new Map((await operations.collect()).map((record) => [`${record.source}:${record.vacid}`, record]));
    const refreshed = operations.loadPublished().map((vacancy) => {
      const record = current.get(`${vacancy.source}:${vacancy.sourceId}`);
      return record ? { ...vacancy, ...normalizeRecord(record), tgMsgId: vacancy.tgMsgId } : vacancy;
    });
    if (dryRun) {
      console.log(`Preview: ${refreshed.length} vacancies; no messages or files changed.`);
      return;
    }
    for (const vacancy of refreshed.filter((item) => item.tgMsgId)) {
      await operations.updateTelegram(vacancy, token!, chatId!);
      console.log(`Updated Telegram message ${vacancy.tgMsgId}`);
    }
    operations.savePublished(refreshed);
    return;
  }

  const collected = await operations.collect();
  const published = operations.loadPublished();
  const publishedKeys = new Set(published.map((v) => `${v.source}:${v.sourceId}`));
  const publishedContent = new Map(published.filter(v => isListedVacancy(v))
    .map(v => [vacancyFingerprint(v), v] as const).filter(([key]) => !!key));
  let refreshedReposts = false;
  const maxNew = Math.max(1, Number(process.env.MAX_NEW_VACANCIES || 10));
  const candidates = collected
    .filter((record) => !publishedKeys.has(`${record.source}:${record.vacid}`))
    .sort((a, b) => b.reg_date.localeCompare(a.reg_date))
    .filter((record) => {
      const incoming = normalizeRecord(record);
      const key = vacancyFingerprint(incoming);
      if (!key) return true;
      const existing = publishedContent.get(key);
      if (existing) {
        if (!dryRun && published.includes(existing) && incoming.date > existing.date) {
          existing.repostSources = [...(existing.repostSources ?? []), {
            source: incoming.source, sourceId: incoming.sourceId,
            sourceUrl: incoming.sourceUrl, date: incoming.date,
          }];
          existing.date = incoming.date;
          refreshedReposts = true;
        }
        return false;
      }
      publishedContent.set(key, incoming);
      return true;
    })
    .slice(0, maxNew);

  console.log(`Collected ${collected.length} unique vacancies; ${candidates.length} new candidates.`);
  if (dryRun) {
    for (const vacancy of candidates.map(normalizeRecord)) console.log(`${vacancy.source}: ${vacancy.title} — ${vacancy.company}`);
    return;
  }

  if (refreshedReposts) operations.savePublished(published);

  for (const record of candidates) {
    const vacancy = normalizeRecord(record);
    vacancy.tgMsgId = await operations.sendToTelegram(vacancy, token!, chatId!);
    published.unshift(vacancy);
    operations.savePublished(published);
    console.log(`Published ${vacancy.source}:${vacancy.sourceId} as Telegram message ${vacancy.tgMsgId}`);
    await new Promise((resolve) => setTimeout(resolve, 1_100));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runPipeline({ dryRun: process.argv.includes("--dry-run"), refresh: process.argv.includes("--refresh") }).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
