import assert from 'node:assert/strict';
import { mkdtemp, cp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { checkRelease, checkSourceRevision } from './release-guard.mjs';

const expected = 'a'.repeat(40);
const git = (latest = expected, dirty = '') => args => args[0] === 'fetch' ? '' : args[0] === 'status' ? dirty : args[1] === 'HEAD' ? expected : latest;
assert.deepEqual(checkSourceRevision(expected, git()), []);
assert.ok(checkSourceRevision(expected, git('b'.repeat(40))).includes('Source changed while release was building'));
assert.ok(checkSourceRevision(expected, git(expected, ' M components/Hero.tsx')).some(error => error.includes('Tracked source')));
assert.ok(checkSourceRevision('short', git()).includes('Invalid expected release SHA'));
assert.ok(checkSourceRevision(expected, () => { throw new Error('offline'); }).includes('Cannot verify current release revision'));
assert.deepEqual(await checkRelease(), []);
const fixture = await mkdtemp(path.join(os.tmpdir(), 'robota-release-guard-'));
const files = ['components/Hero.tsx', 'components/HeroPhoneVideo.tsx', 'app/globals.css', 'app/layout.tsx', 'components/TelegramClickAnalytics.tsx', 'app/go/[id]/route.ts', 'auth.ts', 'app/api/auth-options/route.ts', 'public/video/hero-welcome.mp4', 'public/video/hero-welcome-poster.jpg', 'data/collected-vacancies.json', 'lib/telegram-source-pages.json'];
try {
  for (const file of files) {
    await mkdir(path.dirname(path.join(fixture, file)), { recursive: true });
    await cp(file, path.join(fixture, file));
  }
  assert.deepEqual(await checkRelease(fixture), []);
  await writeFile(path.join(fixture, 'components/Hero.tsx'), '<HeroHeadVideo src="hero-head-turn.mp4" />');
  assert.ok((await checkRelease(fixture)).some(error => error.includes('retired head')));
  await cp('components/Hero.tsx', path.join(fixture, 'components/Hero.tsx'));
  await rm(path.join(fixture, 'app/go/[id]/route.ts'));
  assert.ok((await checkRelease(fixture)).some(error => error.includes('Missing app/go')));
  await cp('app/go/[id]/route.ts', path.join(fixture, 'app/go/[id]/route.ts'));
  await writeFile(path.join(fixture, 'auth.ts'), 'export const auth = {};');
  assert.ok((await checkRelease(fixture)).some(error => error.includes('AUTH_GOOGLE_SECRET')));
  await cp('auth.ts', path.join(fixture, 'auth.ts'));
  await writeFile(path.join(fixture, 'components/TelegramClickAnalytics.tsx'), 'export default function Analytics() {}');
  assert.ok((await checkRelease(fixture)).some(error => error.includes('affiliate_click')));
  await cp('components/TelegramClickAnalytics.tsx', path.join(fixture, 'components/TelegramClickAnalytics.tsx'));
  await writeFile(path.join(fixture, 'lib/telegram-source-pages.json'), '[]');
  assert.ok((await checkRelease(fixture)).some(error => error.includes('Missing Telegram source page')));
  await cp('lib/telegram-source-pages.json', path.join(fixture, 'lib/telegram-source-pages.json'));
  const baseline = path.join(fixture, 'before.json');
  const data = JSON.parse(await readFile(path.join(fixture, 'data/collected-vacancies.json')));
  await writeFile(baseline, JSON.stringify(data));
  await writeFile(path.join(fixture, 'data/collected-vacancies.json'), JSON.stringify(data.slice(1)));
  assert.ok((await checkRelease(fixture, { baseline })).some(error => error.includes('Vacancy removed')));
  const withPost = data.find(vacancy => vacancy.tgMsgId);
  assert.ok(withPost, 'baseline has a Telegram post');
  await writeFile(path.join(fixture, 'data/collected-vacancies.json'), JSON.stringify(data.map(vacancy => vacancy.id === withPost.id ? { ...vacancy, tgMsgId: withPost.tgMsgId + 1 } : vacancy)));
  assert.ok((await checkRelease(fixture, { baseline })).some(error => error.includes('Telegram post changed')));
  assert.ok((await checkRelease(fixture, { built: true })).some(error => error.includes('Missing built Worker')));
  await mkdir(path.join(fixture, '.open-next/assets/video'), { recursive: true });
  await writeFile(path.join(fixture, '.open-next/worker.js'), '// fixture');
  for (const media of ['hero-welcome.mp4', 'hero-welcome-poster.jpg']) {
    await cp(path.join(fixture, 'public/video', media), path.join(fixture, '.open-next/assets/video', media));
  }
  assert.deepEqual(await checkRelease(fixture, { built: true }), []);
  await writeFile(path.join(fixture, '.open-next/assets/video/hero-welcome.mp4'), 'stale video');
  assert.ok((await checkRelease(fixture, { built: true })).some(error => error.includes('differs from current source')));
  console.log('PASS: release guard rejects retired hero, missing redirects, missing build and vacancy loss');
} finally { await rm(fixture, { recursive: true, force: true }); }
