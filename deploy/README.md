# GitHub Actions — щоденна публікація в Telegram

Файл `github-actions-telegram-daily-publish.yml` — це workflow для щоденної
автопублікації вакансій у Telegram о 8:00 UTC.

Його не додано напряму в `.github/workflows/`, бо поточний git-токен не має
права `workflow`. Щоб активувати автопублікацію:

1. Створи файл `.github/workflows/telegram-daily-publish.yml` через веб-інтерфейс
   GitHub (Actions → New workflow) і встав вміст із цього файлу; **або**
   локально надай токену право `workflow` (`gh auth refresh -s workflow`) і
   перемісти файл назад у `.github/workflows/`.
2. Додай у Settings → Secrets and variables → Actions два секрети:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHANNEL_ID`
