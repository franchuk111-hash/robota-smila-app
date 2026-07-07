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
    const check = () =>
      setAllowed(localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted");
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
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
