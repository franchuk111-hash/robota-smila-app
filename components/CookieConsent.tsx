"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { COOKIE_CONSENT_KEY, CONSENT_EVENT } from "@/lib/consent";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(COOKIE_CONSENT_KEY)) setShow(true);
  }, []);

  const choose = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
      window.dispatchEvent(new Event(CONSENT_EVENT));
    } catch {}
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="cookie-consent"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 24 }}
        >
          <div className="cookie-inner">
            <div className="cookie-text">
              🍪 Ми використовуємо файли cookie, щоб сайт працював коректно та щоб
              аналізувати відвідуваність. Аналітичні cookie вмикаються лише за вашою
              згодою. Детальніше — у{" "}
              <Link href="/polityka-cookie">Політиці cookie</Link> та{" "}
              <Link href="/polityka-konfidentsiynosti">Політиці конфіденційності</Link>.
            </div>
            <div className="cookie-actions">
              <button className="btn ghost sm" onClick={() => choose("declined")}>
                Тільки необхідні
              </button>
              <motion.button
                className="btn"
                onClick={() => choose("accepted")}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 250, damping: 13 }}
              >
                Прийняти всі
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
