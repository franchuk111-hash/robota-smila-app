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
