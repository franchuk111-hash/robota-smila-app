import { mkdir, writeFile } from 'node:fs/promises';
import { ALL_VACANCIES } from '../lib/data';
import { mirrorVacancy, type MirrorConfig, type MirrorResult } from '../lib/telegram-mirrors';
import destinations from '../config/telegram-destinations.json';

// Usage: mirror-telegram-vacancy.ts <id>[,<id>...][:channel-username] [channel-username]
// The ":channel" suffix lets the existing single-input workflow target one mirror.
// Copies existing group posts in the given order; an optional channel limits delivery to that one mirror.
async function main() {
  const [idList, suffix] = (process.argv[2] ?? '').split(':');
  const ids = idList.split(',').map(s => Number(s.trim())).filter(Boolean);
  if (!ids.length || ids.length > 10 || !ids.every(Number.isSafeInteger) || new Set(ids).size !== ids.length) throw new Error('Pass 1-10 distinct vacancy IDs');
  const only = (process.argv[3] || suffix || '').replace(/^@/, '').trim();
  const base = destinations as MirrorConfig;
  if (only && !base.mirrors.some(m => m.username === only && m.enabled)) throw new Error('Unknown or disabled channel');
  const config: MirrorConfig = only ? { ...base, mirrors: base.mirrors.map(m => ({ ...m, enabled: m.username === only })) } : base;
  const vacancies = ids.map(id => ALL_VACANCIES.find(v => v.id === id));
  if (vacancies.some(v => !v?.tgMsgId)) throw new Error('Every vacancy must already have a confirmed primary-group post');
  if (!process.env.TELEGRAM_BOT_TOKEN) throw new Error('Missing bot credential');
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_RUN_ATTEMPT !== '1') throw new Error('Check saved per-channel receipts before rerunning; use a fresh dispatch only after reconciliation');
  const all: { vacancyId: number; sourceMessageId: number; results: MirrorResult[] }[] = [];
  let failed = false;
  for (const vacancy of vacancies) {
    const results = (await mirrorVacancy(vacancy!, process.env.TELEGRAM_BOT_TOKEN, { config, persistGit: process.env.GITHUB_ACTIONS === 'true' }))
      .filter(row => row.status !== 'disabled');
    all.push({ vacancyId: vacancy!.id, sourceMessageId: vacancy!.tgMsgId!, results });
    console.log(JSON.stringify({ vacancyId: vacancy!.id, results }));
    // Stop the batch on any uncertain delivery so receipts can be reconciled first.
    if (results.some(row => !['published', 'already-published'].includes(row.status))) { failed = true; break; }
  }
  await mkdir('reports', { recursive: true });
  await writeFile('reports/telegram-mirrors.json', JSON.stringify({ checkedAt: new Date().toISOString(), only: only || null, vacancies: all }, null, 2) + '\n');
  if (failed) process.exitCode = 1;
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Mirror operation failed'); process.exitCode = 1; });
