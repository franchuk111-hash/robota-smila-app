"use client";
import { usePathname } from "next/navigation";
import { getOutboundHref, OUTBOUND_REL } from "@/lib/outbound-links";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TELEGRAM_CHANNEL_URL } from "@/lib/data";
import { trackEvent, GA4_EVENTS } from "@/lib/ga4";
import { consentDecided } from "@/lib/consent";
import SubscriberCount from "./SubscriberCount";

const KEY = "rs_subpopup_seen";

export default function SubscribePopup() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!show) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]'
    ));
    (focusable()[0] || dialog).focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setShow(false);
      }
      if (event.key !== "Tab") return;
      const elements = focusable();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) { event.preventDefault(); dialog.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    const onFocus = (event: FocusEvent) => {
      if (!dialog.contains(event.target as Node)) (focusable()[0] || dialog).focus();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocus);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocus);
      document.body.style.overflow = previousOverflow;
      if (previous?.isConnected) previous.focus();
    };
  }, [show]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // The compact bar is sufficient on phones; do not interrupt vacancy browsing.
    if (window.matchMedia("(max-width: 640px)").matches) return;
    try { if (sessionStorage.getItem(KEY)) return; } catch {}

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
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscribe-popup-title"
            tabIndex={-1}
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
            <h3 id="subscribe-popup-title">Не проґав нові вакансії Сміли</h3>
            <p>
              Щодня публікуємо свіжі вакансії міста в Telegram. Підпишись — і будеш
              першим, хто відгукнеться на найкращі пропозиції.
            </p>
            <SubscriberCount />
            <motion.a
              href={getOutboundHref(TELEGRAM_CHANNEL_URL, pathname)}
              target="_blank"
              rel={OUTBOUND_REL}
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
