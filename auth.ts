import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

import { authAvailability } from "@/lib/auth-availability";
import { verifyTelegramPayload } from "@/lib/telegram-auth";

export const { handlers, signIn, signOut, auth } = NextAuth(() => {
  const available = authAvailability(process.env);
  return {
  trustHost: true,
  providers: [
    ...(available.google ? [Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })] : []),
    ...(available.telegram ? [Credentials({
      id: "telegram",
      name: "Telegram",
      credentials: { payload: {} },
      async authorize(credentials) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken || !credentials?.payload) return null;
        const data = await verifyTelegramPayload(credentials.payload, botToken);
        if (!data) return null;
        return {
          id: "tg_" + data.id,
          name:
            [data.first_name, data.last_name].filter(Boolean).join(" ") ||
            data.username ||
            "Користувач Telegram",
          image: data.photo_url ?? null,
        };
      },
    })] : []),
  ],
  pages: { signIn: "/uvijty" },
  };
});
