import { NextResponse } from 'next/server';
import { authAvailability } from '@/lib/auth-availability';
import { telegramDomainReady } from '@/lib/telegram-readiness';

export const dynamic = 'force-dynamic';

let cachedUsername: { value: string; expires: number } | null = null;

export async function GET(request: Request) {
  const available = authAvailability(process.env);
  let telegramUsername = available.telegramUsername;
  if (available.telegram && !telegramUsername) {
    if (cachedUsername && cachedUsername.expires > Date.now()) telegramUsername = cachedUsername.value;
    else {
      try {
        // The bot token stays server-side; never log this URL or the API response.
        const response = await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`, {
          cache: 'no-store', signal: AbortSignal.timeout(5000),
        });
        const body = await response.json();
        const username = body?.result?.username;
        if (response.ok && body.ok === true && body.result?.is_bot === true &&
            typeof username === 'string' && /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username)) {
          telegramUsername = username;
          cachedUsername = { value: username, expires: Date.now() + 300000 };
        }
      } catch {
        // Fail closed: do not advertise a widget whose public username is unknown.
      }
    }
  }
  if (telegramUsername && request) {
    const { hostname } = new URL(request.url);
    if ((hostname === 'robota-smila.com.ua' || hostname === 'www.robota-smila.com.ua') &&
        !await telegramDomainReady(telegramUsername, `https://${hostname}`)) telegramUsername = null;
  }
  return NextResponse.json({ google: available.google, telegramUsername }, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
