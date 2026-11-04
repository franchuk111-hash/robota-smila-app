import { mkdir, open, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import defaultConfig from '../config/telegram-destinations.json';
import type { Vacancy } from './data';

type Destination = { username: string; chatId?: number; enabled: boolean };
export type MirrorConfig = {
  primary: { username: string; chatId?: number; expectedType?: string };
  mirrors: Destination[];
};
type LedgerPost = {
  vacancyId: number; chatId: number; sourceChatId: number; sourceMessageId: number;
  status: 'pending' | 'published' | 'rejected'; updatedAt: string;
  messageId?: number; errorCode?: number;
};
type Ledger = { version: 1; posts: Record<string, LedgerPost> };
export type MirrorResult = {
  username: string; chatId?: number; vacancyId: number; messageId?: number;
  status: 'disabled' | 'published' | 'already-published' | 'pending' | 'blocked' | 'rejected' | 'error';
  reason?: string;
};
type Options = { config?: MirrorConfig; stateFile?: string; fetcher?: typeof fetch; persistGit?: boolean };

function gitCheckpoint(file: string, status: string): void {
  const relative = path.relative(process.cwd(), path.resolve(file));
  if (!relative.startsWith(`data${path.sep}`) || relative.split(path.sep).includes('..')) throw new Error('Invalid ledger path for Git persistence');
  const run = (args: string[]) => execFileSync('git', args, { stdio: 'ignore' });
  run(['add', '--', relative]);
  let changed = false;
  try { run(['diff', '--quiet', 'HEAD', '--', relative]); } catch { changed = true; }
  if (changed) run(['commit', '--only', '-m', `Keep Telegram mirror delivery ${status} durable before another run`, '-m', 'Constraint: Preserve primary posts and commit only the mirror ledger\nConfidence: high\nScope-risk: narrow\nTested: Telegram delivery checkpoint and allowlisted destination identity\nDirective: Reconcile pending sends before retrying; never retry the Telegram request automatically', '--', relative]);
  for (let attempt = 0; attempt < 3; attempt++) {
    try { run(['push', 'origin', 'HEAD:main']); return; } catch { /* Retry Git persistence only, never Telegram delivery. */ }
  }
  throw new Error('Could not persist the mirror checkpoint');
}

async function saveLedger(file: string, ledger: Ledger, persistGit: boolean, status: string) {
  const temporary = `${file}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(ledger, null, 2) + '\n');
  await rename(temporary, file);
  if (persistGit) gitCheckpoint(file, status);
}

// Callers serialize publication jobs. A local exclusive lock also prevents overlapping processes.
// Every new copy has a durable pending checkpoint; ambiguous sends are never retried here.
export async function mirrorVacancy(v: Vacancy, token: string, {
  config = defaultConfig as MirrorConfig,
  stateFile = 'data/telegram-mirror-posts.json', fetcher = fetch, persistGit = false,
}: Options = {}): Promise<MirrorResult[]> {
  const result = (target: Destination, status: MirrorResult['status'], reason?: string): MirrorResult => ({ username: target.username, chatId: target.chatId, vacancyId: v.id, status, ...(reason ? { reason } : {}) });
  if (!config.mirrors.some(target => target.enabled)) return config.mirrors.map(target => result(target, 'disabled'));
  if (!token || !Number.isSafeInteger(v.tgMsgId) || v.tgMsgId! <= 0) return config.mirrors.map(target => result(target, target.enabled ? 'blocked' : 'disabled', target.enabled ? 'missing-bot-or-primary-message' : undefined));
  await mkdir(path.dirname(stateFile), { recursive: true });
  let lock;
  try { lock = await open(`${stateFile}.lock`, 'wx'); }
  catch { return config.mirrors.map(target => result(target, target.enabled ? 'blocked' : 'disabled', target.enabled ? 'ledger-locked-reconcile-prior-run' : undefined)); }
  const output: MirrorResult[] = [];
  try {
    let ledger: Ledger = { version: 1, posts: {} };
    try { ledger = JSON.parse(await readFile(stateFile, 'utf8')) as Ledger; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw new Error('Invalid mirror ledger'); }
    if (ledger.version !== 1 || !ledger.posts || Array.isArray(ledger.posts)) throw new Error('Invalid mirror ledger');
    async function api(method: 'getMe' | 'getChat' | 'getChatMember' | 'copyMessage', parameters: Record<string, unknown> = {}) {
      try {
        const response = await fetcher(`https://api.telegram.org/bot${token}/${method}`, {
          method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(parameters), signal: AbortSignal.timeout(20000),
        });
        return { response, data: await response.json() as { ok: boolean; error_code?: number; result?: Record<string, unknown> } };
      } catch { throw new Error('Telegram request unavailable'); }
    }
    async function read(method: 'getMe' | 'getChat' | 'getChatMember', parameters?: Record<string, unknown>) {
      const {response, data} = await api(method, parameters);
      if (!response.ok || data.ok !== true || !data.result) throw new Error('Telegram read unavailable');
      return data.result;
    }
    const bot = await read('getMe');
    if (!Number.isSafeInteger(bot.id) || bot.is_bot !== true) throw new Error('Invalid bot identity');
    const primary = await read('getChat', {chat_id:`@${config.primary.username.replace(/^@/, '')}`});
    if (!Number.isSafeInteger(primary.id) || !['group', 'supergroup'].includes(String(primary.type)) || (config.primary.chatId !== undefined && primary.id !== config.primary.chatId) || (config.primary.expectedType && primary.type !== config.primary.expectedType)) throw new Error('Primary group identity changed');
    const seen = new Set<number>();
    for (const target of config.mirrors) {
      if (!target.enabled) { output.push(result(target, 'disabled')); continue; }
      if (!Number.isSafeInteger(target.chatId) || target.chatId! >= 0) { output.push(result(target, 'blocked', 'missing-pinned-channel-id')); continue; }
      if (seen.has(target.chatId!)) { output.push(result(target, 'blocked', 'duplicate-channel-alias')); continue; }
      seen.add(target.chatId!);
      const key = `${v.id}:${target.chatId}`;
      const existing = ledger.posts[key];
      if (existing?.status === 'pending') {
        if (persistGit) { try { gitCheckpoint(stateFile, 'pending'); } catch { output.push(result(target, 'pending', 'pending-checkpoint-not-pushed-reconcile-before-retry')); continue; } }
        output.push(result(target, 'pending', 'ambiguous-prior-send-reconcile-before-retry')); continue;
      }
      if (existing?.status === 'published') {
        if (!Number.isSafeInteger(existing.messageId) || existing.sourceChatId !== primary.id || existing.sourceMessageId !== v.tgMsgId) { output.push(result(target, 'blocked', 'published-reference-needs-reconciliation')); continue; }
        if (persistGit) { try { gitCheckpoint(stateFile, 'published'); } catch { output.push({...result(target, 'error', 'publication-confirmed-checkpoint-not-pushed'), messageId:existing.messageId}); continue; } }
        output.push({...result(target, 'already-published'), messageId:existing.messageId}); continue;
      }
      if (existing && existing.status !== 'rejected') { output.push(result(target, 'blocked', 'invalid-ledger-entry')); continue; }
      try {
        const chat = await read('getChat', {chat_id:`@${target.username.replace(/^@/, '')}`});
        if (chat.type !== 'channel' || chat.id !== target.chatId) { output.push(result(target, 'blocked', 'channel-identity-or-type-mismatch')); continue; }
        if (chat.linked_chat_id === primary.id || primary.linked_chat_id === chat.id) { output.push(result(target, 'blocked', 'linked-to-primary-group-would-duplicate')); continue; }
        const member = await read('getChatMember', {chat_id:target.chatId, user_id:bot.id});
        if (member.status !== 'administrator' || member.can_post_messages !== true) { output.push(result(target, 'blocked', 'bot-needs-channel-posting-right')); continue; }
        ledger.posts[key] = {vacancyId:v.id, chatId:target.chatId!, sourceChatId:primary.id as number, sourceMessageId:v.tgMsgId!, status:'pending', updatedAt:new Date().toISOString()};
        await saveLedger(stateFile, ledger, persistGit, 'pending');
        const {response, data} = await api('copyMessage', {chat_id:target.chatId, from_chat_id:primary.id, message_id:v.tgMsgId});
        if (data.ok === false) {
          ledger.posts[key] = {...ledger.posts[key], status:'rejected', updatedAt:new Date().toISOString(), ...(Number.isInteger(data.error_code) ? {errorCode:data.error_code} : {})};
          await saveLedger(stateFile, ledger, persistGit, 'rejected');
          output.push(result(target, 'rejected', 'telegram-explicitly-rejected-copy')); continue;
        }
        if (!response.ok || data.ok !== true || !Number.isSafeInteger(data.result?.message_id)) throw new Error('Ambiguous Telegram delivery');
        const messageId = data.result!.message_id as number;
        ledger.posts[key] = {...ledger.posts[key], status:'published', messageId, updatedAt:new Date().toISOString()};
        await saveLedger(stateFile, ledger, persistGit, 'published');
        output.push({...result(target, 'published'), messageId});
      } catch {
        const post = ledger.posts[key];
        const pending = post?.status === 'pending';
        output.push({...result(target, pending ? 'pending' : 'error', pending ? 'send-or-checkpoint-incomplete-reconcile-before-retry' : post?.status === 'published' ? 'publication-confirmed-checkpoint-not-pushed' : 'channel-check-or-checkpoint-failed'), ...(post?.status === 'published' ? {messageId:post.messageId} : {})});
      }
    }
  } catch {
    const done = new Set(output.map(row => row.username));
    for (const target of config.mirrors) if (!done.has(target.username)) output.push(result(target, target.enabled ? 'error' : 'disabled', target.enabled ? 'bot-primary-or-ledger-check-failed' : undefined));
  } finally {
    await lock.close();
    await unlink(`${stateFile}.lock`);
  }
  return output;
}
