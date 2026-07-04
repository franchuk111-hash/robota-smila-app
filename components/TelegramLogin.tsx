"use client";
import { useEffect, useRef } from "react";
import { signIn } from "next-auth/react";

// Telegram Login Widget. Потрібен NEXT_PUBLIC_TELEGRAM_BOT_USERNAME (ім'я бота без @).
export default function TelegramLogin() {
  const ref = useRef<HTMLDivElement>(null);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

  useEffect(() => {
    if (!botUsername || !ref.current) return;
    // глобальний колбек, який викликає віджет після успішного входу
    (window as unknown as { onTelegramAuth: (u: Record<string, string>) => void }).onTelegramAuth =
      (user) => {
        signIn("telegram", { payload: JSON.stringify(user), callbackUrl: "/" });
      };
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    ref.current.appendChild(script);
  }, [botUsername]);

  if (!botUsername) {
    return (
      <div
        style={{
          color: "var(--muted)",
          fontSize: 14,
          background: "var(--soft)",
          borderRadius: 12,
          padding: 14,
        }}
      >
        Вхід через Telegram буде доступний після налаштування бота
        (NEXT_PUBLIC_TELEGRAM_BOT_USERNAME).
      </div>
    );
  }
  return <div ref={ref} style={{ display: "flex", justifyContent: "center" }} />;
}
