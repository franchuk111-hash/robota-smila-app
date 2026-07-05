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

## Деплой на Cloudflare Workers

Проєкт адаптований під [@opennextjs/cloudflare](https://opennext.js.org/cloudflare) — деплоїться як звичайний Next.js застосунок (SSR/SSG, API-роути), без переписування на статику.

**Через CLI (потрібен один раз `wrangler login`):**
```bash
npm run deploy   # opennextjs-cloudflare build && opennextjs-cloudflare deploy
```

**Локальний прев'ю на справжньому Workers runtime:**
```bash
npm run preview  # build + wrangler preview, http://localhost:8788
```

**Секрети** (не через `.env`, а через Wrangler):
```bash
npx wrangler secret put AUTH_SECRET
npx wrangler secret put AUTH_GOOGLE_ID
npx wrangler secret put AUTH_GOOGLE_SECRET
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put ADMIN_TELEGRAM_CHAT_ID
```
`NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` — публічна змінна, вона вшивається в код на етапі **збірки** (`next build`), тому її потрібно покласти в `.env.local` (або передати як build-time env у налаштуваннях CI) ПЕРЕД `npm run deploy` — `wrangler secret`/`vars` тут не підходять, бо ті доступні лише в рантаймі.

**Домен:** Cloudflare Dashboard → Workers & Pages → цей Worker → Settings → Domains & Routes → додай `robota-smila.com.ua` (домен має бути підключений до цього ж Cloudflare-акаунту).

**Кеш (опційно):** зараз інкрементальний кеш ISR не налаштований (сайт переважно статичний — некритично). Для продакшн-кешування сторінок дивись [opennext.js.org/cloudflare/caching](https://opennext.js.org/cloudflare/caching) — потрібен R2-бакет.

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
