// Публіковує нові вакансії у Telegram канал
// Використання: npm run telegram-publish або як Cloudflare Worker cron trigger
import fs from "fs";
import path from "path";
import { VACANCIES } from "../lib/data";

// Завантаж змінні з .dev.vars якщо вони не встановлені
let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
let TELEGRAM_CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
  const devVarsPath = path.join(__dirname, "../.dev.vars");
  if (fs.existsSync(devVarsPath)) {
    const content = fs.readFileSync(devVarsPath, "utf-8");
    const lines = content.split("\n");
    lines.forEach((line) => {
      const [key, value] = line.split("=");
      if (key === "TELEGRAM_BOT_TOKEN") TELEGRAM_BOT_TOKEN = value;
      if (key === "TELEGRAM_CHANNEL_ID") TELEGRAM_CHANNEL_ID = value;
    });
  }
}

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHANNEL_ID) {
  console.error("❌ Потрібні TELEGRAM_BOT_TOKEN та TELEGRAM_CHANNEL_ID (в .dev.vars або env)");
  process.exit(1);
}

// Отримай вакансії за останній день (або всі гарячі)
function getPublishVacancies(hours = 24) {
  const now = new Date();
  const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);

  return VACANCIES.filter((v) => new Date(v.date) > cutoff)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5); // Максимум 5 за раз
}

// Форматуй вакансію для Telegram
function formatVacancy(v: (typeof VACANCIES)[0], index: number): string {
  const badge = v.hot ? "🔥 " : "💼 ";
  const date = new Date(v.date);
  const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  const dateStr = daysAgo === 0 ? "сьогодні" : `${daysAgo} дн. тому`;

  return (
    `${badge}*${v.title}*\n` +
    `💰 ${v.salary[0].toLocaleString("uk-UA")} – ${v.salary[1].toLocaleString("uk-UA")} ₴\n` +
    `🏢 ${v.company}\n` +
    `📍 ${v.district} · ${v.schedule}\n` +
    `${v.exp ? "💪 Досвід від 1 року" : "📚 Без досвіду"}\n` +
    `🕐 ${dateStr}\n` +
    `🔗 https://robota-smila.com.ua/vakansiya/${v.id}`
  );
}

// Відправ повідомлення в Telegram
async function publishToTelegram() {
  const vacancies = getPublishVacancies(24);

  if (vacancies.length === 0) {
    console.log("ℹ️  Нові вакансії не знайдені за останні 24 години");
    return;
  }

  const header = `🔔 *Нові вакансії у Смілі* (${vacancies.length})\n\n`;
  const body = vacancies.map((v, i) => formatVacancy(v, i)).join("\n\n");
  const footer = `\n\n👉 [Всі вакансії](https://robota-smila.com.ua/vakansii)`;

  const text = header + body + footer;

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL_ID,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Telegram API error: ${error.description}`);
    }

    const result = await response.json();
    console.log(`✅ Опубліковано в Telegram: ${vacancies.length} вакансій (message_id: ${result.result.message_id})`);
  } catch (error) {
    console.error("❌ Помилка публікації в Telegram:", error);
    process.exit(1);
  }
}

publishToTelegram();
