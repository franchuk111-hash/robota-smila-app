# Shared Telegram vacancy template

The PNG is 1200 × 480 (2.5:1), white with blue accents, source title, salary and company. Sewing jobs get a spool; other jobs get a neutral briefcase. XML is escaped; title/company wrap and shrink instead of truncation. Caption keeps the first source phone, useful complete conditions and a first-party detail URL. Full original vacancy facts remain on the website.

- Renderer: `lib/vacancy-card.ts`, existing Sharp installation; no new dependency.
- Caption/upload: `lib/telegram-vacancy.ts`; real multipart PNG upload, never SVG URLs.
- Preview only: `node --import tsx scripts/preview-telegram.ts <vacancy-id>`.
- Source import: `npm run vacancies:sync`; new posts use photos. `--refresh` preserves existing text messages and updates photo messages using their stored format.
- Compatibility alias: `npm run telegram-publish`; deduplicated source import, not a recent-post resend. Existing environment variables or `.dev.vars` are accepted by this alias.
- The scheduled GitHub facts-only refresh remains unchanged: no automatic new vacancies or Telegram messages are enabled by this template change.
- The manual Promodiah workflow can refresh the image on the already approved message 1411. It never creates a second post for an already published vacancy. Its receipt is retained as a workflow artifact.

Telegram does not provide an idempotency key for sendPhoto. No transport retry occurs after an ambiguous send; reconcile the channel and saved references before manually rerunning an interrupted new-message import. Existing pipeline record deduplication is not an exactly-once delivery guarantee.

API reference checked 2026-11-04: https://core.telegram.org/bots/api#sendphoto and https://core.telegram.org/bots/api#editmessagemedia (text messages can be replaced with photo media; captions are limited to 1024 parsed characters, and this implementation also bounds raw HTML conservatively).

Rollback: revert the template integration commit(s), run the existing checked website release. Telegram edits are external state: restore message 1411 separately from the saved pre-change text if needed; do not delete the message or change its ID.
