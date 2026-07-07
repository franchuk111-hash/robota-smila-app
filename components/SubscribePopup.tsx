"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TELEGRAM_CHANNEL_URL } from "@/lib/data";
import { trackEvent, GA4_EVENTS } from "@/lib/ga4";
import { consentDecided } from "@/lib/consent";
import SubscriberCount from "./SubscriberCount";

const KEY = "rs_subpopup_seen";

export default function SubscribePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(KEY)) return;

    let fired = false;
    const open = () => {
      if (fired) return;
      // Поки не вирішено щодо cookie — не показуємо (щоб не перекривати банер).
      if (!consentDecided()) return;
      fired = true;
      setShow(true);
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
    };

    // Desktop: намір піти (курсор до верхнього краю)
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) open();
    };
    // Mobile / fallback: через 35 сек на сторінці
    const timer = setTimeout(open, 35000);

    document.addEventListener("mouseout", onLeave);
    return () => {
      document.removeEventListener("mouseout", onLeave);
      clearTimeout(timer);
    };
  }, []);

  const close = () => setShow(false);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={close}
        >
          <motion.div
            className="popup-card"
            initial={{ scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 250, damping: 18 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="popup-close" onClick={close} aria-label="Закрити">
              ✕
            </button>
            <div className="popup-emoji">🔔</div>
            <h3>Не проґав нові вакансії Сміли</h3>
            <p>
              Щодня публікуємо свіжі вакансії міста в Telegram. Підпишись — і будеш
              першим, хто відгукнеться на найкращі пропозиції.
            </p>
            <SubscriberCount />
            <motion.a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn lg"
              style={{ width: "100%", justifyContent: "center", marginTop: 8 }}
              onClick={() => {
                trackEvent(GA4_EVENTS.TELEGRAM_SUBSCRIBE, { source: "exit_popup" });
                close();
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 250, damping: 13 }}
            >
              Підписатись на Telegram
            </motion.a>
            <button className="popup-skip" onClick={close}>
              Пізніше
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
