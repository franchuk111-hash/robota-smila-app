import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { mirrorVacancy, type MirrorConfig } from '../lib/telegram-mirrors';
import type { Vacancy } from '../lib/data';
const vacancy={id:7,tgMsgId:1411} as Vacancy;
const config:MirrorConfig={primary:{username:'primary',chatId:-1001},mirrors:[{username:'channel',chatId:-1002,enabled:true}]};
async function fixture() { const dir=await mkdtemp(path.join(os.tmpdir(),'telegram-mirrors-')); return {dir,stateFile:path.join(dir,'ledger.json')}; }
function api({rights=true, linked=false, timeout=false, reject=false}:{rights?:boolean;linked?:boolean;timeout?:boolean;reject?:boolean}={}) {
  const calls:{method:string;parameters:Record<string,unknown>}[]=[];
  const fetcher=(async (url,options)=>{
    const method=String(url).split('/').at(-1)!; const parameters=JSON.parse(String(options!.body)); calls.push({method,parameters});
    let result:Record<string,unknown>;
    if(method==='getMe') result={id:42,is_bot:true};
    else if(method==='getChat' && parameters.chat_id==='@primary') result={id:-1001,type:'supergroup'};
    else if(method==='getChat') result={id:parameters.chat_id==='@other'?-1003:-1002,type:'channel',...(linked?{linked_chat_id:-1001}:{})};
    else if(method==='getChatMember') result={status:'administrator',can_post_messages:rights};
    else if(method==='copyMessage') {
      if(timeout) throw new Error('private-token-leak');
      if(reject) return new Response(JSON.stringify({ok:false,error_code:403,description:'private-token-leak'}),{status:403});
      result={message_id:88};
    } else throw new Error('Unexpected method');
    return new Response(JSON.stringify({ok:true,result}),{status:200});
  }) as typeof fetch;
  return {fetcher,calls};
}
test('disabled destinations perform no Telegram calls',async()=>{
  const mock=api();const result=await mirrorVacancy(vacancy,'fake',{config:{...config,mirrors:config.mirrors.map(x=>({...x,enabled:false}))},fetcher:mock.fetcher});
  assert.equal(result[0].status,'disabled');assert.equal(mock.calls.length,0);
});
test('channel posting right and linked group safeguards block copies',async()=>{
  for(const settings of [{rights:false},{linked:true}]) { const f=await fixture();const mock=api(settings);try {
    const result=await mirrorVacancy(vacancy,'fake',{config,stateFile:f.stateFile,fetcher:mock.fetcher});
    assert.equal(result[0].status,'blocked');assert(!mock.calls.some(c=>c.method==='copyMessage'));
  }finally{await rm(f.dir,{recursive:true});} }
});
test('successful copies preserve primary, dedupe aliases and skip a second run',async()=>{
  const f=await fixture();const mock=api();try{
    const aliases={...config,mirrors:[...config.mirrors,{...config.mirrors[0],username:'alias'}]};
    const first=await mirrorVacancy(vacancy,'fake',{config:aliases,stateFile:f.stateFile,fetcher:mock.fetcher});
    assert.equal(first[0].status,'published');assert.equal(first[0].messageId,88);assert.equal(first[1].reason,'duplicate-channel-alias');
    const copy=mock.calls.filter(c=>c.method==='copyMessage');assert.equal(copy.length,1);assert.deepEqual(copy[0].parameters,{chat_id:-1002,from_chat_id:-1001,message_id:1411});
    const second=await mirrorVacancy(vacancy,'fake',{config,stateFile:f.stateFile,fetcher:mock.fetcher});assert.equal(second[0].status,'already-published');
    assert.equal(mock.calls.filter(c=>c.method==='copyMessage').length,1);
    const ledger=JSON.parse(await readFile(f.stateFile,'utf8'));assert.equal(ledger.posts['7:-1002'].status,'published');
  }finally{await rm(f.dir,{recursive:true});}
});
test('ambiguous timeout remains pending and blocks re-send',async()=>{
  const f=await fixture();const mock=api({timeout:true});try{
    const first=await mirrorVacancy(vacancy,'fake',{config,stateFile:f.stateFile,fetcher:mock.fetcher});assert.equal(first[0].status,'pending');
    const second=await mirrorVacancy(vacancy,'fake',{config,stateFile:f.stateFile,fetcher:mock.fetcher});assert.equal(second[0].status,'pending');
    assert.equal(mock.calls.filter(c=>c.method==='copyMessage').length,1);assert(!JSON.stringify(first).includes('private-token-leak'));
  }finally{await rm(f.dir,{recursive:true});}
});
test('explicit rejection can be retried without losing a successful other destination',async()=>{
  const f=await fixture();const mock=api();let reject=true;
  const fetcher=(async(url,options)=>{
    if(String(url).endsWith('/copyMessage')&&JSON.parse(String(options!.body)).chat_id===-1002&&reject) return new Response(JSON.stringify({ok:false,error_code:403}),{status:403});
    return mock.fetcher(url,options);
  }) as typeof fetch;
  const multiple={...config,mirrors:[...config.mirrors,{username:'other',chatId:-1003,enabled:true}]};
  try{
    const first=await mirrorVacancy(vacancy,'fake',{config:multiple,stateFile:f.stateFile,fetcher});assert.deepEqual(first.map(r=>r.status),['rejected','published']);
    reject=false;const second=await mirrorVacancy(vacancy,'fake',{config:multiple,stateFile:f.stateFile,fetcher});assert.deepEqual(second.map(r=>r.status),['published','already-published']);
    assert.equal(mock.calls.filter(c=>c.method==='copyMessage'&&c.parameters.chat_id===-1003).length,1);
  }finally{await rm(f.dir,{recursive:true});}
});
test('existing pending checkpoint and wrong pinned identity are fail-closed',async()=>{
  const f=await fixture();const mock=api();try{
    await writeFile(f.stateFile,JSON.stringify({version:1,posts:{'7:-1002':{status:'pending'}}}));
    assert.equal((await mirrorVacancy(vacancy,'fake',{config,stateFile:f.stateFile,fetcher:mock.fetcher}))[0].status,'pending');
    const wrong={...config,mirrors:[{username:'channel',chatId:-1009,enabled:true}]};
    assert.equal((await mirrorVacancy(vacancy,'fake',{config:wrong,stateFile:f.stateFile,fetcher:mock.fetcher}))[0].reason,'channel-identity-or-type-mismatch');
    assert(!mock.calls.some(c=>c.method==='copyMessage'));
  }finally{await rm(f.dir,{recursive:true});}
});

test('nonpositive primary post IDs never reach Telegram',async()=>{
 const mock=api();const results=await mirrorVacancy({...vacancy,tgMsgId:0},'fake',{config,fetcher:mock.fetcher});
 assert.equal(results[0].status,'blocked');assert.equal(mock.calls.length,0);
});
