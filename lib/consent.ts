// Спільні константи для механізму згоди на cookie.
export const COOKIE_CONSENT_KEY = "rs_cookie_consent"; // "accepted" | "declined"
export const CONSENT_EVENT = "rs-consent-changed";
export const CONSENT_SETTINGS_EVENT = "rs-consent-settings";

// Чи користувач уже зробив вибір щодо cookie (у браузері).
export function consentDecided(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(COOKIE_CONSENT_KEY) != null; } catch { return false; }
}
