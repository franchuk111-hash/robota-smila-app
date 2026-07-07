# Telegram Integration Setup

## 🤖 Bot Configuration

### 1. Create Telegram Bot
- Open [@BotFather](https://t.me/BotFather) in Telegram
- Send `/newbot`
- Follow the prompts
- Copy the **Bot Token** (format: `123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### 2. Get Channel ID
- Create a channel in Telegram (e.g., `@robota_smila_ua`)
- Open channel link: `https://t.me/robota_smila_ua`
- Add bot as admin to the channel
- Use @userinfobot to find channel ID (starts with `-100`)

**Example IDs from your setup:**
- `-1002967213414` (primary channel)
- `-1002945383854` (backup channel)

## 📝 Environment Variables

Add to `.dev.vars`:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=-1002967213414
```

For production, add to Cloudflare Worker secrets:
```bash
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHANNEL_ID
```

## 🔄 Daily Auto-Publishing

### Option 1: Manual Script
```bash
npm run telegram-publish
```
Publishes vacancies from the last 24 hours to Telegram channel.

### Option 2: Cloudflare Cron Trigger (Recommended)
The worker automatically publishes vacancies daily at **8:00 UTC** (configured in `wrangler.jsonc`).

To change the schedule, edit:
```jsonc
"triggers": {
  "crons": ["0 8 * * *"]  // 0 = minute, 8 = hour (UTC), * = every day
}
```

**Cron format:** `minute hour day month day_of_week`
- `0 8 * * *` = 8:00 UTC every day
- `0 18 * * *` = 18:00 UTC every day
- `0 9 * * 1` = 9:00 UTC every Monday

### Option 3: Scheduled Cloud Agent
Use Claude Code `/schedule` skill to run the script on a custom schedule:
```bash
/schedule "npm run telegram-publish" --cron "0 8 * * *"
```

## 📊 Message Format

The bot sends:
```
🔔 *Нові вакансії у Смілі* (N)

🔥 *Посада*
💰 Salary range
🏢 Company
📍 District · Schedule
📚/💪 Experience level
🕐 Posted date
🔗 Link to vacancy

👉 All vacancies link
```

## 🧪 Testing

### Test the script locally:
```bash
npm run telegram-publish
```

### Test Telegram API connection:
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/getMe
```

### Check if bot is admin in channel:
```bash
curl -X POST https://api.telegram.org/bot<TOKEN>/getChatMember \
  -d "chat_id=-1002967213414&user_id=<BOT_ID>"
```

## 🚀 Deployment

```bash
# Deploy with Telegram integration
npm run build && npm run deploy
```

The cron trigger will activate automatically.

## ✅ Verification Checklist

- [ ] Bot token is valid
- [ ] Bot is admin in the channel
- [ ] Channel ID is correct (negative number)
- [ ] `.dev.vars` has credentials
- [ ] `wrangler.jsonc` has cron trigger configured
- [ ] Deploy succeeds: `npm run deploy`
- [ ] Manual test works: `npm run telegram-publish`
- [ ] Cloudflare dashboard shows scheduled trigger active

## 📚 References

- [Telegram Bot API Docs](https://core.telegram.org/bots/api)
- [Cloudflare Cron Triggers](https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/)
- [Cloudflare Secrets Management](https://developers.cloudflare.com/workers/configuration/secrets/)
