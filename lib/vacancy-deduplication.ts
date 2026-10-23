import type { Vacancy } from './data';

// Editorially verified reposts. Keep their records and Telegram IDs for history.
export const VERIFIED_DUPLICATES: Readonly<Record<number, number>> = {
  1434448599: 1153443280,
  1194563632: 1120345139,
  1685064708: 1493989206,
  1327971622: 1114405795,
  1533129565: 1220850666,
};

const normalize = (text: string) => text.normalize('NFKC').toLowerCase()
  .replace(/№\s*вакансії:\s*\d+/gu, '')
  .replace(/[’‘`]/gu, "'").replace(/\s+/gu, ' ').trim();

// Require complete matching terms, not just the same job title or employer.
// Exclude publication date/source IDs: these change when the same ad is reposted.
export function vacancyFingerprint(v: Vacancy): string | undefined {
  if (!v.title.trim() || !v.company.trim() || v.short.trim().length < 30) return undefined;
  if (normalize(v.company) === 'роботодавець не вказаний') return undefined;
  return JSON.stringify([
    v.title, v.company, v.district, v.type, v.schedule, v.short,
    ...v.duties, '|requirements|', ...v.req, '|offer|', ...v.offer,
    v.salaryNote ?? '', v.paymentFrequency ?? '',
  ].map(normalize).concat([JSON.stringify(v.salary), String(v.exp)]));
}

export function duplicateVacancyTargets(records: Vacancy[]): Map<number, number> {
  const ids = new Set(records.map(v => v.id));
  const targets = new Map<number, number>();
  const seen = new Map<string, number>();
  for (const v of [...records].sort((a, b) => b.date.localeCompare(a.date) || a.id - b.id)) {
    const verified = VERIFIED_DUPLICATES[v.id];
    if (verified && ids.has(verified)) { targets.set(v.id, verified); continue; }
    const key = vacancyFingerprint(v);
    if (!key) continue;
    const existing = seen.get(key);
    if (existing !== undefined) targets.set(v.id, existing);
    else seen.set(key, v.id);
  }
  return targets;
}
