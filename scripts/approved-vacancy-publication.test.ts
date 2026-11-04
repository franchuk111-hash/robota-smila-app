import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {publishApprovedVacancies,verifyLiveVacancy} from '../lib/approved-vacancy-publication';
import {mirrorVacancy} from '../lib/telegram-mirrors';
import config from '../config/telegram-destinations.json';
import {salaryFmt,type Vacancy} from '../lib/data';
const v={id:987654321,slug:'test-only',title:'Тестова вакансія',company:'Тестова компанія',salary:[15000,30000],date:new Date().toISOString().slice(0,10),telegramPublish:true,short:'Лише ізольований тест',req:[],offer:[],duties:[],schedule:'5/2',cat:'other',type:'OTHER',catName:'Інше',typeName:'Уточнюйте',district:'Сміла',exp:false} as Vacancy;
async function fixture(fn:(o:{manualFile:string;stateFile:string;dir:string})=>Promise<void>,values=[v]) {const dir=await mkdtemp(path.join(os.tmpdir(),'approved-publication-'));try{const manualFile=path.join(dir,'manual.json');await writeFile(manualFile,JSON.stringify(values));await fn({manualFile,stateFile:path.join(dir,'primary.json'),dir});}finally{await rm(dir,{recursive:true,force:true});}}

test('new approved vacancy: live site then one compact primary send and four copies; rerun sends nothing',()=>fixture(async o=>{
 const events:string[]=[];let copies=0;let primary=0;
 const fetcher=async(url:unknown,init?:RequestInit)=>{const method=String(url).split('/').pop();const body=JSON.parse(String(init?.body));let result:unknown;
 if(method==='getMe')result={id:1,is_bot:true};
 if(method==='getChat') {const name=String(body.chat_id).slice(1);result=name===config.primary.username?{id:config.primary.chatId,type:'supergroup'}:{id:config.mirrors.find(x=>x.username===name)!.chatId,type:'channel'};}
 if(method==='getChatMember')result={status:'administrator',can_post_messages:true};
 if(method==='copyMessage'){assert.equal(body.from_chat_id,config.primary.chatId);assert.equal(body.message_id,500);copies++;result={message_id:600+copies};}
 return new Response(JSON.stringify({ok:true,result}));
 };
 const options={...o,checkpoint:(file:string)=>{events.push('checkpoint:'+path.basename(file));},verify:async()=>{events.push('live');},send:async()=>{primary++;assert.equal(JSON.parse(await readFile(o.stateFile,'utf8')).posts[v.id].status,'pending');events.push('sendPhoto');return 500;},mirror:(vacancy:Vacancy)=>mirrorVacancy(vacancy,'test',{stateFile:path.join(o.dir,'mirror.json'),fetcher:fetcher as typeof fetch})};
 const first=await publishApprovedVacancies('test',options);assert.equal(primary,1);assert.equal(copies,4);assert.equal(first[0].channels.length,4);assert.equal(events[0],'live');assert.ok(events.indexOf('checkpoint:primary.json')<events.indexOf('sendPhoto'));
 const second=await publishApprovedVacancies('test',options);assert.equal(primary,1);assert.equal(copies,4);assert.ok(second[0].channels.every(x=>x.status==='already-published'));assert.equal(second[0].messageId,500);
}));
test('primary timeout remains durable pending and never auto-resends',()=>fixture(async o=>{
 let sends=0;const opts={...o,checkpoint:()=>{},verify:async()=>{},send:async()=>{sends++;throw new Error('timeout');},mirror:async()=>[]};
 await assert.rejects(publishApprovedVacancies('test',opts));await assert.rejects(publishApprovedVacancies('test',opts),/pending/);assert.equal(sends,1);
}));
test('unverified live vacancy and failed remote checkpoint cannot reach Telegram',()=>fixture(async o=>{
 let sends=0;const send=async()=>{sends++;return 99;};
 await assert.rejects(publishApprovedVacancies('test',{...o,checkpoint:()=>{},verify:async()=>{throw new Error('404');},send}));
 await assert.rejects(publishApprovedVacancies('test',{...o,checkpoint:()=>{throw new Error('git failed');},verify:async()=>{},send}));assert.equal(sends,0);
}));
test('historical and explicitly website-only records never enter queue',()=>fixture(async o=>{const results=await publishApprovedVacancies('',{...o,checkpoint:()=>{},verify:async()=>{throw new Error('unexpected');}});assert.deepEqual(results,[]);},[{...v,telegramPublish:undefined},{...v,id:v.id+1,telegramPublish:false}]));
test('confirmed receipt recovers missing manual reference without another primary post',()=>fixture(async o=>{
 let calls=0;let failManual=true;const opts={...o,checkpoint:(file:string)=>{if(file===o.manualFile && failManual)throw new Error('git failed');},verify:async()=>{},send:async()=>{calls++;return 500;},mirror:async()=>config.mirrors.map(t=>({username:t.username,vacancyId:v.id,status:'already-published' as const,messageId:42}))};
 await assert.rejects(publishApprovedVacancies('test',opts));await writeFile(o.manualFile,JSON.stringify([v]));failManual=false;await publishApprovedVacancies('test',opts);assert.equal(calls,1);
}));
test('live preflight rejects wrong canonical or mismatched content',async()=>{
 const html=`<link rel="canonical" href="https://robota-smila.com.ua/vakansiya/${v.id}"/>${v.title} ${v.company} ${v.short} ${salaryFmt(v.salary)}`;
 await verifyLiveVacancy(v,(async()=>new Response(html)) as typeof fetch);
 await assert.rejects(verifyLiveVacancy(v,(async()=>new Response(html.replace(v.company,'Інша'))) as typeof fetch));
 await assert.rejects(verifyLiveVacancy(v,(async()=>new Response(html.replace('/vakansiya/','/other/'))) as typeof fetch));
});
