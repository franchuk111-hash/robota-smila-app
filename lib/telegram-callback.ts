// Telegram credentials are short-lived URL parameters: remove them before any async work.
export async function completeTelegramCallback(
  href: string,
  clearUrl: (path: string) => void,
  signIn: (payload: string) => Promise<{ error?: string | null; ok?: boolean } | undefined>,
  navigate: (path: string) => void,
): Promise<boolean> {
  const url = new URL(href);
  clearUrl(url.pathname);
  const allowed = new Set(['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash']);
  const payload: Record<string, string> = {};
  for (const [key, value] of url.searchParams) {
    if (!allowed.has(key) || Object.hasOwn(payload, key)) return false;
    payload[key] = value;
  }
  if (!payload.id || !payload.auth_date || !payload.hash) return false;
  try {
    const result = await signIn(JSON.stringify(payload));
    if (!result || result.error || result.ok !== true) return false;
    navigate('/profil');
    return true;
  } catch {
    return false;
  }
}
