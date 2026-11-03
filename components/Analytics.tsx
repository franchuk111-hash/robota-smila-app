"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { COOKIE_CONSENT_KEY, CONSENT_EVENT } from "@/lib/consent";

const GA_ID = "G-TRNR43ZLM5";

// GA4 завантажується ЛИШЕ після згоди користувача на аналітичні cookie.
// Без згоди — жодних скриптів Google і жодних cookie аналітики.
export default function Analytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const check = () => {
      let accepted = false;
      try { accepted = localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted"; } catch { /* Fail closed. */ }
      // Unmounting Script does not unload an already-running Google tag.
      // Disable its measurement too when consent is withdrawn, including in another tab.
      (window as typeof window & Record<string, unknown>)[`ga-disable-${GA_ID}`] = !accepted;
      setAllowed(accepted);
    };
    check();
    window.addEventListener(CONSENT_EVENT, check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener(CONSENT_EVENT, check);
      window.removeEventListener("storage", check);
    };
  }, []);

  if (!allowed) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
