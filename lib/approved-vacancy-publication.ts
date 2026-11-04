import { createHash } from 'node:crypto';
import { mkdir, open, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { salaryFmt, type Vacancy } from './data';
import { isListedVacancy } from './vacancy-lifecycle';
import { sendVacancyPhoto } from './telegram-vacancy';
import { gitCheckpoint, mirrorVacancy, type MirrorResult } from './telegram-mirrors';
import destinations from '../config/telegram-destinations.json';

type Receipt = { status:'pending'|'published'; fingerprint:string; chatId:number; messageId?:number; updatedAt:string };
type State = {version:1; posts:Record<string,Receipt>};
type Options = {
  manualFile?:string; stateFile?:string;
  checkpoint?:(file:string,status:string)=>void;
  verify?:(v:Vacancy)=>Promise<void>;
  send?:(v:Vacancy)=>Promise<number>;
  mirror?:(v:Vacancy)=>Promise<MirrorResult[]>;
};
const hash = (v:Vacancy) => createHash('sha256').update(JSON.stringify([v.id,v.title,v.company,v.salary,v.short,v.req,v.offer,v.duties,v.schedule,v.district,v.exp,v.type,v.typeName,v.date,v.validThrough])).digest('hex');
const escape = (s:string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');

export async function verifyLiveVacancy(v:Vacancy, fetcher=fetch):Promise<void> {
  const url=`https://robota-smila.com.ua/vakansiya/${v.id}`;
  const response=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(30000)});
  const html=await response.text();
  if(response.status!==200 || !html.includes(`rel="canonical" href="${url}"`) ||
    !html.includes(escape(v.title)) || !html.includes(escape(v.company)) ||
    !html.includes(escape(v.short)) || !html.includes(escape(salaryFmt(v.salary)))) throw new Error(`Live vacancy ${v.id} does not match the approved release`);
}

export async function publishApprovedVacancies(token:string, {
  manualFile='data/manual-vacancies.json', stateFile='data/telegram-primary-posts.json',
  checkpoint=(file,status)=>gitCheckpoint(file,status), verify=verifyLiveVacancy,
  send=v=>sendVacancyPhoto(v,token,String(destinations.primary.chatId)),
  mirror=v=>mirrorVacancy(v,token,{persistGit:true}),
}:Options={}) {
  await mkdir(path.dirname(stateFile),{recursive:true});
  const lock=await open(`${stateFile}.lock`,'wx');
  const results:{vacancyId:number;messageId:number;channels:MirrorResult[]}[]=[];
  async function save(file:string,value:unknown,status:string) {
    const tmp=`${file}.${process.pid}.tmp`;
    await writeFile(tmp,JSON.stringify(value,null,2)+'\n'); await rename(tmp,file); checkpoint(file,status);
  }
  try {
    const manual=JSON.parse(await readFile(manualFile,'utf8')) as Vacancy[];
    let state:State={version:1,posts:{}};
    try {state=JSON.parse(await readFile(stateFile,'utf8'));} catch(e) {if((e as NodeJS.ErrnoException).code!=='ENOENT')throw e;}
    if(state.version!==1 || !state.posts || Array.isArray(state.posts))throw new Error('Invalid primary delivery ledger');
    // Only explicit approvals enter this queue; never import the historical backlog.
    const queue=manual.filter(v=>v.telegramPublish===true && isListedVacancy(v));
    if(queue.length && !token)throw new Error('Missing Telegram bot credential');
    for(const vacancy of queue) {
      const key=String(vacancy.id); const receipt=state.posts[key];
      if(receipt && (receipt.fingerprint!==hash(vacancy) || receipt.chatId!==destinations.primary.chatId))throw new Error(`Vacancy ${key}: changed content or group requires reconciliation`);
      if(receipt?.status==='pending')throw new Error(`Vacancy ${key}: pending primary delivery; reconcile before retrying`);
      if(receipt && receipt.status!=='published')throw new Error('Invalid primary receipt status');
      await verify(vacancy);
      if(!vacancy.tgMsgId) {
        if(receipt?.status==='published') {
          if(!Number.isSafeInteger(receipt.messageId) || receipt.messageId!<=0)throw new Error('Invalid confirmed primary message ID');
          vacancy.tgMsgId=receipt.messageId;
        } else {
          state.posts[key]={status:'pending',fingerprint:hash(vacancy),chatId:destinations.primary.chatId,updatedAt:new Date().toISOString()};
          await save(stateFile,state,'primary-pending'); // Remote persistence precedes sendPhoto.
          const messageId=await send(vacancy); // Never automatically retry an uncertain request.
          if(!Number.isSafeInteger(messageId) || messageId<=0)throw new Error('Invalid primary Telegram confirmation');
          state.posts[key]={...state.posts[key],status:'published',messageId,updatedAt:new Date().toISOString()};
          await save(stateFile,state,'primary-published');
          vacancy.tgMsgId=messageId;
        }
        vacancy.tgPostFormat='photo';
        await save(manualFile,manual,'primary-reference');
      } else if(receipt && receipt.messageId!==vacancy.tgMsgId)throw new Error('Conflicting primary message references');
      const channels=await mirror(vacancy);
      results.push({vacancyId:vacancy.id,messageId:vacancy.tgMsgId!,channels});
      if(channels.some(r=>!['published','already-published'].includes(r.status)))throw new Error(`Vacancy ${key}: incomplete channel delivery; reconcile receipts`);
    }
    return results;
  } finally {await lock.close();await unlink(`${stateFile}.lock`);}
}
