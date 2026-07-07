"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TELEGRAM_CHANNEL_URL } from "@/lib/data";
import { trackEvent, GA4_EVENTS } from "@/lib/ga4";
import { consentDecided, CONSENT_EVENT } from "@/lib/consent";
import SubscriberCount from "./SubscriberCount";

const KEY = "rs_subbar_closed";

export default function SubscribeBar() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY)) return;

    let timer: ReturnType<typeof setTimeout>;
    // Не перекриваємо cookie-банер: показуємо лише після вибору щодо cookie.
    const start = () => {
      if (!consentDecided()) return;
      timer = setTimeout(() => setShow(true), 1200);
      window.removeEventListener(CONSENT_EVENT, start);
    };
    start();
    window.addEventListener(CONSENT_EVENT, start);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CONSENT_EVENT, start);
    };
  }, []);

  const close = () => {
    setShow(false);
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="subbar"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
        >
          <div className="subbar-inner">
            <div className="subbar-text">
              <span className="subbar-ico">🔔</span>
              <div>
                <b>Нові вакансії Сміли — щодня в Telegram</b>
                <SubscriberCount compact />
              </div>
            </div>
            <div className="subbar-actions">
              <motion.a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn"
                onClick={() => trackEvent(GA4_EVENTS.TELEGRAM_SUBSCRIBE, { source: "sticky_bar" })}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 250, damping: 13 }}
              >
                Підписатись
              </motion.a>
              <button className="subbar-close" onClick={close} aria-label="Закрити">
                ✕
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
