import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import crypto from "crypto";

// Перевірка підпису даних Telegram Login Widget (HMAC-SHA256 з токеном бота)
function verifyTelegram(data: Record<string, string>, botToken: string): boolean {
  const { hash, ...fields } = data;
  if (!hash) return false;
  const secret = crypto.createHash("sha256").update(botToken).digest();
  const checkString = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join("\n");
  const hmac = crypto.createHmac("sha256", secret).update(checkString).digest("hex");
  return hmac === hash;
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
        if (!verifyTelegram(data, botToken)) return null;
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
