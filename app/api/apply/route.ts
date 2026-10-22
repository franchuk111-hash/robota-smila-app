import { NextResponse } from "next/server";

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    body = parsed;
  } catch {
    return NextResponse.json({ ok: false, error: "Некоректний запит" }, { status: 400 });
  }
  const fields = ["name", "phone", "vacancy", "company", "message", "placement"] as const;
  const data: Record<string, string> = {};
  for (const field of fields) {
    if (body[field] !== undefined && typeof body[field] !== "string") {
      return NextResponse.json({ ok: false, error: "Перевірте поля форми" }, { status: 422 });
    }
    data[field] = ((body[field] as string) || "").trim();
    if (data[field].length > (field === "message" ? 2400 : 160)) {
      return NextResponse.json({ ok: false, error: "Скоротіть текст заявки" }, { status: 422 });
    }
  }
  const employer = body.kind === "employer";
  if (!data.name || !/^\+?[\d\s()\-]{7,25}$/.test(data.phone) || data.phone.replace(/\D/g, "").length < 7 ||
      (employer && (!data.vacancy || !data.company || !data.message))) {
    return NextResponse.json({ ok: false, error: "Вкажіть необхідні поля та коректний телефон" }, { status: 422 });
  }
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.ADMIN_TELEGRAM_CHAT_ID;
  const unavailable = () => NextResponse.json({ ok: false, error: "Не вдалося підтвердити доставку. Напишіть @Smila_admin у Telegram." }, { status: 503 });
  const uncertain = () => NextResponse.json({ ok: false, delivery: "unknown", error: "Статус доставки невідомий: заявка могла надійти. Уточніть у @Smila_admin перед повтором, щоб уникнути дубля." }, { status: 504 });
  if (!token || !chatId) return unavailable();
  // Plain text: user input cannot inject Telegram HTML. Never log credentials or lead data.
  const text = [employer ? "📩 Заявка роботодавця" : "📩 Новий відгук",
    data.vacancy && `Вакансія: ${data.vacancy}`, data.company && `Компанія: ${data.company}`,
    `Ім'я: ${data.name}`, `Телефон: ${data.phone}`, data.placement && `Формат: ${data.placement}`,
    data.message && `Повідомлення: ${data.message}`].filter(Boolean).join("\n");
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }), signal: AbortSignal.timeout(10000),
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) return unavailable();
  } catch {
    return uncertain();
  }
  return NextResponse.json({ ok: true });
}
