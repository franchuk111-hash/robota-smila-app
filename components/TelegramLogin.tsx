"use client";
import { useEffect, useRef } from "react";

// Public username is supplied by runtime server configuration.
export default function TelegramLogin({ botUsername }: { botUsername: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!botUsername || !ref.current) return;
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", botUsername);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "12");
    script.setAttribute("data-auth-url", new URL("/uvijty/telegram", window.location.origin).href);
    const container = ref.current;
    container.appendChild(script);
    return () => {
      container.replaceChildren();
    };
  }, [botUsername]);

  return <div ref={ref} style={{ display: "flex", justifyContent: "center" }} />;
}
