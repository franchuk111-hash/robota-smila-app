import { NextResponse } from "next/server";

// Повертає реальну кількість підписників Telegram-каналу.
// Токен бота лишається на сервері (ніколи не потрапляє в клієнт).
// Кешуємо в пам'яті воркера на 5 хв, щоб не смикати Telegram на кожен запит.

let cache: { count: number; ts: number } | null = null;
const TTL = 5 * 60 * 1000;

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return NextResponse.json({ count: cache.count }, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !chatId) {
    return NextResponse.json({ count: null });
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getChatMemberCount?chat_id=${chatId}`
    );
    const json = await res.json();
    if (json.ok && typeof json.result === "number") {
      cache = { count: json.result, ts: Date.now() };
      return NextResponse.json({ count: json.result }, {
        headers: { "Cache-Control": "public, max-age=300" },
      });
    }
  } catch {
    // Telegram недоступний — не валимо, просто без числа
  }

  return NextResponse.json({ count: cache?.count ?? null });
}
