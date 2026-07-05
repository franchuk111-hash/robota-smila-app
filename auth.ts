import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

// Перевірка підпису Telegram Login Widget (HMAC-SHA256) через Web Crypto API —
// сумісно і з Node.js, і з Cloudflare Workers (edge runtime).
function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyTelegram(
  data: Record<string, string>,
  botToken: string
): Promise<boolean> {
  const { hash, ...fields } = data;
  if (!hash) return false;

  const enc = new TextEncoder();
  const secretKeyBytes = await crypto.subtle.digest("SHA-256", enc.encode(botToken));

  const checkString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join("\n");

  const hmacKey = await crypto.subtle.importKey(
    "raw",
    secretKeyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", hmacKey, enc.encode(checkString));
  return toHex(sig) === hash;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      id: "telegram",
      name: "Telegram",
      credentials: { payload: {} },
      async authorize(credentials) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken || !credentials?.payload) return null;
        let data: Record<string, string>;
        try {
          data = JSON.parse(credentials.payload as string);
        } catch {
          return null;
        }
        // підпис має бути валідним і не старшим за 24 години
        if (!(await verifyTelegram(data, botToken))) return null;
        if (Date.now() / 1000 - Number(data.auth_date) > 86400) return null;
        return {
          id: "tg_" + data.id,
          name:
            [data.first_name, data.last_name].filter(Boolean).join(" ") ||
            data.username ||
            "Користувач Telegram",
          image: data.photo_url ?? null,
        };
      },
    }),
  ],
  pages: { signIn: "/uvijty" },
});
