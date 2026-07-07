// Показує превью карточок вакансій в Telegram
import fs from "fs";
import path from "path";
import { VACANCIES, salaryFmt } from "../lib/data";
import { generateVacancyCardSVG } from "../lib/vacancy-card";

function getRecentVacancies(hours = 24) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);

  return VACANCIES.filter((v) => new Date(v.date) > cutoff)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5);
}

function formatVacancy(v: (typeof VACANCIES)[0]): string {
  const badge = v.hot ? "🔥 " : "💼 ";
  const date = new Date(v.date);
  const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  const dateStr = daysAgo === 0 ? "сьогодні" : `${daysAgo} дн. тому`;

  return (
    `${badge}*${v.title}*\n` +
    `💰 ${salaryFmt(v.salary)}\n` +
    `🏢 ${v.company}\n` +
    `📍 ${v.district} · ${v.schedule}\n` +
    `${v.exp ? "💪 Досвід від 1 року" : "📚 Без досвіду"}\n` +
    `🕐 ${dateStr}\n` +
    `🔗 https://robota-smila.com.ua/vakansiya/${v.id}`
  );
}

const vacancies = getRecentVacancies(24);

console.log("\n");
console.log("╔═══════════════════════════════════════════════════════════╗");
console.log("║         📱 ПРЕВЬЮ TELEGRAM ПОСТУ З ВАКАНСІЯМИ           ║");
console.log("╚═══════════════════════════════════════════════════════════╝");
console.log("\n");

const header = `🔔 *Нові вакансії у Смілі* (${vacancies.length})\n`;
console.log(header);

// Формуємо текстові карточки
const divider = "━━━━━━━━━━━━━━━━━━━━━━━";
const cards = vacancies.map((v) => {
  const badge = v.hot ? "🔥" : "💼";
  const exp = v.exp ? "💪" : "📚";

  return (
    `${badge} *${v.title}*\n` +
    `💰 ${salaryFmt(v.salary)}\n` +
    `🏢 ${v.company}\n` +
    `📍 ${v.district} · ${v.schedule}\n` +
    `${exp} ${v.exp ? "Досвід від 1 року" : "Без досвіду"} · ${v.typeName}\n` +
    `🔗 robota-smila.com.ua/vakansiya/${v.id}`
  );
});

console.log(cards.join(`\n${divider}\n`));
console.log(`\n${divider}`);
console.log(`👉 [Всі вакансії](https://robota-smila.com.ua/vakansii)\n`);

console.log("╔═══════════════════════════════════════════════════════════╗");
console.log(`║  ✅ Готово до публікації в: @robota_smila_ua             ║`);
console.log(`║  📤 Буде відправлено: ${vacancies.length} вакансій в одному посту         ║`);
console.log(`║  ⏰ Автопубліківка: щодня о 8:00 UTC (GitHub Actions)     ║`);
console.log("╚═══════════════════════════════════════════════════════════╝\n");
