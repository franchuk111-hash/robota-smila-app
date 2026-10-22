import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// Deliberately fail closed if a release loses the approved production features.
// This checks source/assets; the HTTP smoke test remains the runtime gate.
export function checkSourceRevision(expected, runGit) {
  const failures = [];
  if (!/^[a-f0-9]{40}$/.test(expected)) return ['Invalid expected release SHA'];
  try {
    runGit(['fetch', 'origin', 'main']);
    const head = runGit(['rev-parse', 'HEAD']).trim();
    const latest = runGit(['rev-parse', 'FETCH_HEAD']).trim();
    if (head !== expected || latest !== expected) failures.push('Source changed while release was building');
    if (runGit(['status', '--porcelain', '--untracked-files=no', '--', '.', ':(exclude)reports/**']).trim()) failures.push('Tracked source changed while release was building');
  } catch { failures.push('Cannot verify current release revision'); }
  return failures;
}

export async function checkRelease(root = process.cwd(), { built = false, baseline } = {}) {
  const failures = [];
  const read = async (file) => {
    try { return await readFile(path.join(root, file), 'utf8'); }
    catch { failures.push(`Missing ${file}`); return ''; }
  };
  const requireText = async (file, patterns) => {
    const text = await read(file);
    for (const pattern of patterns) if (!pattern.test(text)) failures.push(`${file}: missing ${pattern}`);
    return text;
  };
  const hero = await requireText('components/Hero.tsx', [/import HeroPhoneVideo /, /<HeroPhoneVideo\s*\/>/]);
  if (/hero-head-turn|HeroHeadVideo/.test(hero)) failures.push('Hero uses the retired head video');
  await requireText('components/HeroPhoneVideo.tsx', [/hero-phone-circle/, /\/video\/hero-welcome\.mp4/, /playsInline/]);
  await requireText('app/globals.css', [/\.hero-phone\b/, /\.hero-phone-circle\b/]);
  await requireText('app/layout.tsx', [/<TelegramClickAnalytics\s*\/>/, /<Analytics\s*\/>/]);
  await requireText('components/TelegramClickAnalytics.tsx', [/affiliate_click/, /page_slug/, /COOKIE_CONSENT_KEY/]);
  await requireText('app/go/[id]/route.ts', [/getOutboundDestination/, /status: 302/, /no-store/, /noindex/, /status: 404/]);
  await requireText('auth.ts', [/authAvailability/, /AUTH_GOOGLE_ID/, /AUTH_GOOGLE_SECRET/]);
  await requireText('app/api/auth-options/route.ts', [/authAvailability/, /no-store/]);
  for (const media of ['hero-welcome.mp4', 'hero-welcome-poster.jpg']) {
    const file = `public/video/${media}`;
    try {
      const source = await readFile(path.join(root, file));
      if (source.length < 1000) failures.push(`${file}: empty or invalid media`);
      if (built) {
        const asset = await readFile(path.join(root, '.open-next/assets/video', media));
        const hash = value => createHash('sha256').update(value).digest('hex');
        if (hash(source) !== hash(asset)) failures.push(`Built ${media} differs from current source`);
      }
    } catch { failures.push(`${file}: missing source or built media`); }
  }
  if (built) {
    try { await stat(path.join(root, '.open-next/worker.js')); }
    catch { failures.push('Missing built Worker'); }
  }
  let current;
  try {
    current = JSON.parse(await read('data/collected-vacancies.json'));
    if (!Array.isArray(current) || !current.length) throw new Error();
    if (new Set(current.map(v => String(v.id))).size !== current.length) failures.push('Duplicate vacancy IDs');
  } catch { failures.push('Invalid or empty vacancy data'); }
  if (current) {
    try {
      const registry = new Set(JSON.parse(await read('lib/telegram-source-pages.json')));
      for (const vacancy of current) if (!registry.has(`vakansiya/${vacancy.id}`)) failures.push(`Missing Telegram source page for vacancy ${vacancy.id}`);
    } catch { failures.push('Invalid Telegram source page registry'); }
  }
  if (baseline && current) {
    const previous = JSON.parse(await readFile(baseline, 'utf8'));
    const byId = new Map(current.map(v => [String(v.id), v]));
    for (const vacancy of previous) {
      const next = byId.get(String(vacancy.id));
      if (!next) failures.push(`Vacancy removed from release: ${vacancy.id}`);
      else if (vacancy.tgMsgId && next.tgMsgId !== vacancy.tgMsgId) failures.push(`Telegram post changed for vacancy ${vacancy.id}`);
    }
  }
  return failures;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const baselineAt = process.argv.indexOf('--baseline');
  const failures = await checkRelease(process.cwd(), { built: process.argv.includes('--built'), baseline: baselineAt >= 0 ? process.argv[baselineAt + 1] : undefined });
  if (process.argv.includes('--built') && process.env.ROBOTA_RELEASE_SHA) {
    failures.push(...checkSourceRevision(process.env.ROBOTA_RELEASE_SHA, args => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })));
  }
  console.log(JSON.stringify({ pass: failures.length === 0, failures }, null, 2));
  if (failures.length) process.exitCode = 1;
}
