import type { Vacancy } from './data';

// Verified 2026-10-22: DCZ supplies 65 грн; the originating Robota listing
// supplies 50–80 грн with percentage-based terms. Neither establishes monthly pay.
// Keep this narrow correction during imports until the source ambiguity is resolved.
export function applyVerifiedSourceCorrections(v: Vacancy): Vacancy {
  if (v.sourceId !== '10843819' || !v.sourceUrl || !/^https:\/\/(?:www\.)?robota\.ua\/company0\/vacancy10843819(?:[/?]|$)/.test(v.sourceUrl)) return v;
  return { ...v, salary: [0, 0], salaryNote: 'Сума оплати потребує уточнення: у джерелах зазначено різні значення. В оголошенні роботодавця — 20% від фрахту та відрядження/ставка. Узгодьте точні умови до відгуку.' };
}
