# Безпека — налаштування на рівні Cloudflare

> Чому не в застосунку: під OpenNext/Cloudflare `next.config` `headers()`/`redirects()`
> та `proxy`/`middleware` працюють ненадійно — `has`-умови ігноруються, а
> `source: "/:path*"` зациклює весь сайт у 308. Тому нижче — все на рівні
> Cloudflare (edge), що безпечно й правильно для цього стеку.

## 1. Примусовий HTTPS (пріоритет #1 з аудиту)
Cloudflare Dashboard → **SSL/TLS → Edge Certificates**:
- **Always Use HTTPS** → **ON**
- Режим SSL/TLS: **Full (strict)**
- **HSTS** → Enable: Max-Age `12 months`, **Include subDomains**, **Preload** — це дає
  заголовок `Strict-Transport-Security` автоматично.

## 2. Security-заголовки (пріоритет #2)
Cloudflare → **Rules → Transform Rules → Modify Response Header** → *Create rule*
(умова: `Hostname equals robota-smila.com.ua`, дія: **Set static** для кожного):

| Header | Value |
|---|---|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), browsing-topics=()` |
| `Content-Security-Policy` | *(рядок нижче)* |

CSP (під GA4 + inline-стилі motion.dev):
```
default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests
```
> HSTS не додавати тут вручну, якщо ввімкнено в п.1 (щоб не дублювати).

## 3. www → apex (301)
Cloudflare → **Rules → Redirect Rules** → *Create rule*:
- **When**: `Hostname equals www.robota-smila.com.ua`
- **Then**: Dynamic redirect →
  `concat("https://robota-smila.com.ua", http.request.uri.path)`
  Status **301**, **Preserve query string** ON.

## 4. DMARC + DKIM (пріоритет #3, DNS)
Cloudflare → **DNS → Records**:
- **DMARC** — TXT `_dmarc`:
  ```
  v=DMARC1; p=quarantine; rua=mailto:postmaster@robota-smila.com.ua; fo=1
  ```
- **DKIM** — залежить від поштового провайдера (додати наданий ним TXT-запис).
- SPF уже є (`~all`).

## Перевірка після налаштування
```
curl -sI https://robota-smila.com.ua/ | grep -iE "strict-transport|content-security|x-frame|x-content-type|referrer|permissions"
curl -sI http://robota-smila.com.ua/        # має бути 301 → https
curl -sI https://www.robota-smila.com.ua/    # має бути 301 → apex
dig +short TXT _dmarc.robota-smila.com.ua
```
Онлайн: securityheaders.com, ssllabs.com/ssltest, hstspreload.org.

## Що вже зроблено в застосунку
- `poweredByHeader: false` — прибрано `x-powered-by` (перевірено: відсутній).
- Аналітика (GA4) вантажиться лише після згоди на cookie (`components/Analytics.tsx`).

## 5. Telegram Login: CSP застосовано 21.10.2026

21.10.2026 існуюче Cloudflare Modify Response Header правило оновлено для всіх вхідних запитів. Збережено один CSP-заголовок та решту захисних заголовків. HTTP-перевірка підтвердила застосування.

Застосований CSP:

```text
default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://telegram.org; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com; frame-src 'self' https://oauth.telegram.org; frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; upgrade-insecure-requests
```

`script-src https://telegram.org` дозволяє використаний у компоненті legacy loader;
`frame-src https://oauth.telegram.org` дозволяє iframe авторизації. `frame-ancestors`
залишається `'self'`: він керує вбудовуванням нашого сайту, а не iframe Telegram.
Запити всередині Telegram iframe підпорядковуються політиці його власного документа;
додавати Telegram до `connect-src` нашого сайту для цього callback-віджета не потрібно.
Google OAuth у поточному NextAuth потоці використовує перенаправлення браузера,
а не Google iframe, тому розширення `frame-src` для Google не потрібне.

Офіційна [документація legacy widget](https://core.telegram.org/widgets/login-legacy)
описує iframe-віджет, callback-поля, HMAC-SHA256 та `auth_date`. Нова
[документація Telegram Login](https://core.telegram.org/bots/telegram-login)
окремо описує OIDC та endpoint `https://oauth.telegram.org/auth`; це інший протокол,
на який цей патч не переводить застосунок. Правило `25cef10dc5fe450da02c91b010ac336f`
оновлено через Cloudflare Dashboard; фактичний HTTP-заголовок збережено у
`reports/live-headers-csp-after.txt`. Попередній заголовок — `reports/live-headers-before.txt`.
Перевірка повного входу користувачем описується окремо від перевірки CSP.

Віджет використовує `data-auth-url` і callback `/uvijty/telegram`, без `data-onauth` та без `unsafe-eval`. Callback прибирає підписані query-поля з адреси до асинхронної обробки, не індексується, має `no-referrer`; сервер перевіряє HMAC і строк payload. Підписаний fixture у workerd підтвердив JWT-cookie, сесію, logout і відхилення зміненого payload.

**Зовнішній блокер:** endpoint Telegram для `SmilaGobot` з origin `https://robota-smila.com.ua` повернув `Bot domain invalid`. Власник бота має виконати `/setdomain` → `SmilaGobot` → `robota-smila.com.ua` у BotFather. Повний вхід реального користувача не підтверджений. Google OAuth credentials у Worker відсутні; кнопка прихована.

Для rollback CSP повернути попередній заголовок з розділу 2 / `reports/live-headers-before.txt`.

### Обмеження заявок

У `app/api/apply/route.ts` немає ліміту частоти. Налаштування WAF/rate limiting
Cloudflare не підтверджені, тому не стверджуємо, що сайт не має edge-захисту.
За потреби додати окреме вузьке правило для POST `/api/apply`; поріг визначати
за реальними запитами, з урахуванням спільних IP. In-memory ліміт у Worker
не забезпечить глобального обмеження, тому він не додавався.
