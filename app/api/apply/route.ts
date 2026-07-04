import { NextResponse } from "next/server";

// Прийом відгуків/заявок. Якщо задано TELEGRAM_BOT_TOKEN + ADMIN_TELEGRAM_CHAT_ID —
// пересилає заявку в Telegram. Інакше просто приймає (можна підключити БД/пошту пізніше).
export async function POST(req: Request) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const name = (body.name || "").trim();
  const phone = (body.phone || "").trim();
  if (!name || !phone) {
    return NextResponse.json(
      { ok: false, error: "Вкажіть ім'я та телефон" },
      { status: 422 }
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
  if (token && chatId) {
    const kind = body.kind === "employer" ? "Нова вакансія" : "Новий відгук";
    const text =
      `📩 <b>${kind}</b>\n` +
      (body.vacancy ? `Вакансія: ${body.vacancy}\n` : "") +
      (body.company ? `Компанія: ${body.company}\n` : "") +
      `Ім'я: ${name}\nТелефон: ${phone}\n` +
      (body.message ? `Повідомлення: ${body.message}` : "");
    try {
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      });
    } catch {
      // не валимо запит, якщо Telegram недоступний
    }
  }

  return NextResponse.json({ ok: true });
}
