# robota-smila (Next.js)

Сайт вакансій для міста Сміла (Черкаська область). Next.js 16 (App Router) + Auth.js (Google + Telegram) + PWA. Дизайн у стилі finder.work.

## Можливості
- Каталог вакансій з фільтрами, сторінки вакансій (Schema.org JobPosting)
- Компанії, блог (SEO-статті), сторінка для роботодавців
- **Авторизація**: Google + Telegram (перевірка підпису на сервері)
- **PWA**: manifest + service worker (встановлення на телефон, офлайн-кеш)
- Збережені вакансії (♡), відгуки та заявки (пересилання в Telegram)
- SEO: robots.txt, sitemap.xml, метадані, hreflang uk-UA

## Локальний запуск
```bash
npm install
cp .env.example .env.local   # заповни AUTH_SECRET (openssl rand -base64 32)
npm run dev                  # http://localhost:3000
```

## Деплой на Vercel (через веб, без CLI)
1. Запуш цей репозиторій на GitHub (вже зроблено).
2. На https://vercel.com → **Add New → Project** → імпортуй репозиторій `robota-smila-app`.
3. У **Environment Variables** додай значення з `.env.example` (див. нижче).
4. **Deploy**. Далі — Settings → Domains → додай `robota-smila.com.ua`.

## Змінні оточення
| Змінна | Де взяти |
|---|---|
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google Cloud Console → Credentials → OAuth client ID (Web). Redirect URI: `https://ТВІЙ-ДОМЕН/api/auth/callback/google` |
| `TELEGRAM_BOT_TOKEN` | @BotFather → новий бот. Далі `/setdomain` → вкажи домен сайту |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | ім'я бота без `@` |
| `ADMIN_TELEGRAM_CHAT_ID` | (необов'язково) куди слати відгуки; дізнатися через @userinfobot |

## Дані
Демо-вакансії/компанії/статті — у `lib/data.ts`. Для реальної бази (постійне зберігання відгуків, вакансій від роботодавців, профілів) підключається Supabase/Postgres — наступний крок.

## Ліцензії
Іконка рукостискання — [Twemoji](https://github.com/twitter/twemoji) © Twitter, ліцензія CC-BY 4.0.
