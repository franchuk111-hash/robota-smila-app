// Агент 6 (розділ 12 стратегії): генерує текст ранкового Telegram-поста
// з актуальних вакансій сайту. Запуск: npm run telegram-post
import { VACANCIES, salaryFmt, dateFmt } from "../lib/data";

const SITE = "https://robota-smila.com.ua";

function buildPost(): string {
  const hot = VACANCIES.filter((v) => v.hot);
  const rest = VACANCIES.filter((v) => !v.hot).sort(
    (a, b) => +new Date(b.date) - +new Date(a.date)
  );
  const picked = [...hot, ...rest].slice(0, 7);

  const lines: string[] = [];
  lines.push("☀️ Вакансії Сміли на сьогодні\n");

  picked.forEach((v) => {
    const badge = v.hot ? "🔥 " : "";
    lines.push(
      `${badge}${v.title} — ${salaryFmt(v.salary)}\n` +
        `${v.company}, ${v.district} · ${v.schedule}${v.exp ? "" : " · без досвіду"}\n` +
        `${SITE}/vakansiya/${v.id}\n`
    );
  });

  lines.push("👉 Всі вакансії: " + SITE + "/vakansii");
  lines.push("Розмістити вакансію: " + SITE + "/rabotodavtsyam");

  return lines.join("\n");
}

const post = buildPost();
console.log("\n=== Готовий текст для Telegram-поста ===\n");
console.log(post);
console.log("\n=== Скопіюй текст вище та встав у Telegram ===\n");
