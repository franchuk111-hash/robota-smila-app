import test from 'node:test';
import assert from 'node:assert/strict';
import { generateVacancyCardSVG, renderVacancyCardPNG } from '../lib/vacancy-card';
import { vacancyPhotoCaption, sendVacancyPhoto } from '../lib/telegram-vacancy';
import records from '../data/manual-vacancies.json';
import { ALL_VACANCIES } from '../lib/data';
import type { Vacancy } from '../lib/data';
const v = records[0] as Vacancy;
test('light cover escapes source text and keeps all long words', () => {
  const title = 'Старший майстер виробництва та оператор автоматизованої швейної лінії';
  const svg = generateVacancyCardSVG({...v,title,company:'ТОВ «A&B <Test>»'});
  assert.match(svg,/fill="#fff"/);
  assert.match(svg,/A&amp;B &lt;Test&gt;/);
  assert.equal(svg.replace(/<[^>]+>/g,'').replace(/\s/g,'' ).includes(title.replace(/\s/g,'')),true);
  assert(!svg.includes('Відгукнутися на вакансію'));
});
test('salary equal bounds and unknown salary use the shared formatting', () => {
  const svg = generateVacancyCardSVG({...v,salary:[15000,15000]});
  assert(!svg.includes('–'));
  assert.match(generateVacancyCardSVG({...v,salary:[0,0]}),/Договірна/);
});
test('caption retains phone and first-party job URL within Telegram limit', () => {
  const caption = vacancyPhotoCaption({...v,req:['Дуже довга вимога '.repeat(200),'Досвід від 1 року']});
  assert(caption.length<=1024);
  assert.match(caption,/\+380634064880/);
  assert.match(caption,new RegExp(`/vakansiya/${v.id}`));
  assert(!caption.includes('…'));
  assert(!caption.includes('📍 Сміла'));
});
test('real PNG and mocked Telegram multipart send/edit', async () => {
  const png = await renderVacancyCardPNG(v);
  assert.equal(png.subarray(1,4).toString(),'PNG');
  assert.equal(png.readUInt32BE(16),1200);
  assert.equal(png.readUInt32BE(20),480);
  let calls = 0;
  const fetcher = (async (url, options) => {
    calls++;
    assert.equal(String(url).endsWith(calls===1?'/sendPhoto':'/editMessageMedia'),true);
    const form = options!.body as FormData;
    const image = form.get('photo') as Blob;
    assert.equal(image.type,'image/png'); assert(image.size>10000);
    assert.equal(form.get('chat_id'),'test-chat');
    if(calls===2) assert.equal(JSON.parse(String(form.get('media'))).media,'attach://photo');
    return new Response(JSON.stringify({ok:true,result:{message_id:1411}}),{status:200});
  }) as typeof fetch;
  assert.equal(await sendVacancyPhoto(v,'fake-token','test-chat',{fetcher}),1411);
  assert.equal(await sendVacancyPhoto(v,'fake-token','test-chat',{messageId:1411,fetcher}),1411);
  assert.equal(calls,2);
});
test('failed photo send is surfaced and never retried automatically', async () => {
  let calls=0;
  await assert.rejects(sendVacancyPhoto(v,'fake-token','test-chat',{fetcher:(async()=>{calls++;return new Response(JSON.stringify({ok:false}),{status:400});}) as typeof fetch}),/did not confirm/);
  assert.equal(calls,1);
});

test('all current vacancy headers fit the compact cover and caption', () => {
  for(const record of ALL_VACANCIES) {
    assert.match(generateVacancyCardSVG(record), /viewBox="0 0 1200 480"/);
    assert(vacancyPhotoCaption(record).length<=1024, String(record.id));
  }
});
