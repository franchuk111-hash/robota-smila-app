import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const DESTINATIONS = [
  'robota_smila_ua', 'smila_vakansii', 'vakansii_smila',
  'smila_vacansii', 'robota_smila', 'smila_job',
];
const METHODS = new Set(['getMe', 'getChat', 'getChatMember']);
const permissionKeys = ['can_send_messages', 'can_send_photos', 'can_send_media_messages', 'can_send_documents', 'can_send_videos', 'can_send_audios', 'can_send_polls', 'can_send_other_messages'];
const permissions = value => Object.fromEntries(permissionKeys.filter(key => typeof value?.[key] === 'boolean').map(key => [key, value[key]]));

export function allowedToPublish(chat, member) {
  if (member?.status === 'creator') return ['channel', 'supergroup', 'group'].includes(chat?.type);
  if (chat?.type === 'channel') return member?.status === 'administrator' && member.can_post_messages === true;
  if (!['supergroup', 'group'].includes(chat?.type)) return false;
  if (member?.status === 'administrator') return true;
  if (member?.status === 'member') return chat.permissions?.can_send_messages === true && (chat.permissions?.can_send_photos === true || chat.permissions?.can_send_media_messages === true);
  if (member?.status === 'restricted') return member.is_member === true && member.can_send_messages === true && (member.can_send_photos === true || member.can_send_media_messages === true);
  return false;
}

export async function inspectTelegramDestinations(token, { fetcher = fetch, destinations = DESTINATIONS } = {}) {
  if (!token) throw new Error('Missing TELEGRAM_BOT_TOKEN');
  async function api(method, parameters = {}) {
    if (!METHODS.has(method)) throw new Error('Diagnostic method is not read-only');
    let response, payload;
    try {
      response = await fetcher(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify(parameters), signal: AbortSignal.timeout(20000),
      });
      payload = await response.json();
    } catch { throw new Error(`${method} unavailable`); }
    if (!response.ok || payload?.ok !== true || !payload.result) {
      const code = Number.isInteger(payload?.error_code) ? payload.error_code : response.status;
      throw new Error(`${method} failed${Number.isInteger(code) ? ` (${code})` : ''}`);
    }
    return payload.result;
  }
  const me = await api('getMe');
  if (!Number.isSafeInteger(me.id) || me.is_bot !== true) throw new Error('getMe returned an invalid bot identity');
  const rows = [];
  const chats = new Map();
  const names = [...new Set(destinations.map(name => name.replace(/^@/, '')))];
  for (const username of names) {
    const row = { username, allowedToPublish: false };
    try {
      const chat = await api('getChat', { chat_id: `@${username}` });
      if (!Number.isSafeInteger(chat.id)) throw new Error('getChat returned an invalid chat ID');
      Object.assign(row, { chatId: chat.id, type: chat.type, title: chat.title ?? '', publicUsername: chat.username ?? null });
      if (Number.isSafeInteger(chat.linked_chat_id)) row.linkedChatId = chat.linked_chat_id;
      row.chatPermissions = permissions(chat.permissions);
      const existing = chats.get(chat.id);
      if (existing) {
        row.aliasOf = existing.username;
        for (const key of ['botStatus', 'canPostMessages', 'canSendMessages', 'botRestrictions', 'allowedToPublish', 'error']) {
          if (Object.hasOwn(existing, key)) row[key] = existing[key];
        }
      } else {
        chats.set(chat.id, row);
        const member = await api('getChatMember', { chat_id: chat.id, user_id: me.id });
        row.botStatus = member.status;
        if (typeof member.can_post_messages === 'boolean') row.canPostMessages = member.can_post_messages;
        if (typeof member.can_send_messages === 'boolean') row.canSendMessages = member.can_send_messages;
        row.botRestrictions = permissions(member);
        row.allowedToPublish = allowedToPublish(chat, member);
      }
    } catch (error) {
      // Only our own fixed diagnostic messages leave this module, never API descriptions or URLs.
      row.error = error.message;
    }
    rows.push(row);
  }
  return { checkedAt: new Date().toISOString(), botUsername: me.username ?? null, destinations: rows };
}

async function main() {
  const report = await inspectTelegramDestinations(process.env.TELEGRAM_BOT_TOKEN);
  await mkdir('reports', { recursive: true });
  await writeFile('reports/telegram-destinations.json', JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => { console.error('Telegram destination diagnostic failed; check bot credential and read access.'); process.exitCode = 1; });
}
