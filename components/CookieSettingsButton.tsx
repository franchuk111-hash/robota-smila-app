"use client";

import { CONSENT_SETTINGS_EVENT } from "@/lib/consent";

export default function CookieSettingsButton() {
  return (
    <button className="btn ghost sm" onClick={() => window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT))}>
      Змінити налаштування cookie
    </button>
  );
}
