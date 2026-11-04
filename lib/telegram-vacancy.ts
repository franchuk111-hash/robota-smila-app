import type { Vacancy } from './data';
import { salaryFmt } from './data';
import { vacancyLocation } from './vacancy-facts';
import { renderVacancyCardPNG } from './vacancy-card';
const escape = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const clean = (s: string) => s.replace(/\s+/gu, ' ').trim();
export function vacancyPhotoCaption(v: Vacancy): string {
  const phone = [v.short, ...v.duties, ...v.req, ...v.offer].join(' ').match(/\+380(?:[\s()-]*\d){9}(?!\d)/u)?.[0]?.trim();
  // Bound raw HTML as well as the visible text so Telegram's 1024 limit is safe.
  const lines = [`💼 <b>${escape(clean(v.title))}</b>`, `🏢 ${escape(clean(v.company))}`, `💰 ${escape(salaryFmt(v.salary))}`, `📍 ${escape(vacancyLocation(v))}`];
  const footer = [phone ? `📞 ${escape(phone)}` : '', `🔎 <a href="https://robota-smila.com.ua/vakansiya/${v.id}">Деталі та контакти на сайті</a>`].filter(Boolean);
  const base = [...lines, '', ...footer].join('\n');
  if (base.length > 1024) throw new Error('Vacancy header exceeds Telegram caption limit; review before publishing');
  const candidates = [v.schedule, ...v.req.slice(0,2), ...v.offer.slice(0,2)];
  const details: string[] = [];
  for (const item of candidates) {
    const detail = `• ${escape(clean(item))}`;
    if (item && [...lines, '', ...details, detail, '', ...footer].join('\n').length <= 1024) details.push(detail);
  }
  return [...lines, ...(details.length ? ['', ...details] : []), '', ...footer].join('\n');
}

export async function sendVacancyPhoto(v: Vacancy, token: string, chatId: string, {messageId, fetcher = fetch}: {messageId?: number; fetcher?: typeof fetch} = {}): Promise<number> {
  const image = await renderVacancyCardPNG(v);
  const form = new FormData();
  form.set('chat_id', chatId);
  form.set('photo', new Blob([new Uint8Array(image)], {type:'image/png'}), `vacancy-${v.id}.png`);
  if (messageId) {
    form.set('message_id', String(messageId));
    form.set('media', JSON.stringify({type:'photo', media:'attach://photo', caption:vacancyPhotoCaption(v), parse_mode:'HTML'}));
  } else {
    form.set('caption', vacancyPhotoCaption(v));
    form.set('parse_mode', 'HTML');
  }
  const response = await fetcher(`https://api.telegram.org/bot${token}/${messageId ? 'editMessageMedia' : 'sendPhoto'}`, {method:'POST',body:form,signal:AbortSignal.timeout(30000)});
  const result = await response.json() as {ok:boolean; description?:string; result?:{message_id:number}};
  if (messageId && result.description?.includes('message is not modified')) return messageId;
  if (!response.ok || !result.ok || !Number.isInteger(result.result?.message_id)) throw new Error('Telegram did not confirm the vacancy photo; reconcile the channel before retrying');
  return result.result!.message_id;
}
