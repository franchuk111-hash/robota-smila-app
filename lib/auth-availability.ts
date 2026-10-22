// Return only public login configuration; never serialize credentials to the client.
export function authAvailability(env: Record<string, string | undefined>) {
  const hasSessionSecret = Boolean(env.AUTH_SECRET || env.NEXTAUTH_SECRET);
  const candidate = (env.TELEGRAM_BOT_USERNAME || env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || '').replace(/^@/, '');
  const telegramUsername = hasSessionSecret && env.TELEGRAM_BOT_TOKEN && /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(candidate) ? candidate : null;
  return {
    telegram: hasSessionSecret && Boolean(env.TELEGRAM_BOT_TOKEN),
    google: hasSessionSecret && Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET),
    telegramUsername,
  };
}
