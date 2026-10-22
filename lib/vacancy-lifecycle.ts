import type { Vacancy } from './data';

// A 30-day review horizon is a listing policy, not an employer-confirmed closing date.
export function isListedVacancy(v: Vacancy, now = Date.now()): boolean {
  const posted = Date.parse(v.date);
  if (!Number.isFinite(posted) || posted > now) return false;
  if (v.validThrough) {
    const expiry = Date.parse(v.validThrough);
    return Number.isFinite(expiry) && expiry > now;
  }
  return posted + 30 * 86400000 > now;
}
