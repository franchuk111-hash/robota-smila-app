// Спільні константи для механізму згоди на cookie.
export const COOKIE_CONSENT_KEY = "rs_cookie_consent"; // "accepted" | "declined"
export const CONSENT_EVENT = "rs-consent-changed";

// Чи користувач уже зробив вибір щодо cookie (у браузері).
export function consentDecided(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOKIE_CONSENT_KEY) != null;
}
