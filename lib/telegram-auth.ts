export type TelegramIdentity = Record<string, string> & { id: string; auth_date: string; hash: string };

// Legacy Telegram Login Widget: validate untrusted JSON before Web Crypto verification.
export async function verifyTelegramPayload(
  payload: unknown, botToken: string, nowSeconds = Math.floor(Date.now() / 1000),
): Promise<TelegramIdentity | null> {
  if (typeof payload !== 'string' || payload.length > 16384 || !botToken) return null;
  try {
    const parsed: unknown = JSON.parse(payload);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const data: Record<string, string> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') data[key] = value;
      else if ((key === 'id' || key === 'auth_date') && typeof value === 'number' && Number.isSafeInteger(value)) data[key] = String(value);
      else return null;
    }
    if (!/^[1-9]\d*$/.test(data.id || '') || !/^\d+$/.test(data.auth_date || '') || !/^[a-f0-9]{64}$/.test(data.hash || '')) return null;
    const timestamp = Number(data.auth_date);
    if (!Number.isSafeInteger(timestamp) || timestamp <= 0 || !Number.isFinite(nowSeconds) || timestamp > nowSeconds + 30 || nowSeconds - timestamp > 86400) return null;
    const { hash, ...fields } = data;
    const enc = new TextEncoder();
    const secret = await crypto.subtle.digest('SHA-256', enc.encode(botToken));
    const key = await crypto.subtle.importKey('raw', secret, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const signature = Uint8Array.from(hash.match(/../g)!, (byte) => parseInt(byte, 16));
    const checkString = Object.keys(fields).sort().map((name) => `${name}=${fields[name]}`).join('\n');
    if (!await crypto.subtle.verify('HMAC', key, signature, enc.encode(checkString))) return null;
    return data as TelegramIdentity;
  } catch {
    return null;
  }
}
