import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedToPublish, inspectTelegramDestinations } from './check-telegram-destinations.mjs';

test('channel publication requires explicit administrator post permission', () => {
  assert.equal(allowedToPublish({type:'channel'}, {status:'administrator',can_post_messages:true}), true);
  assert.equal(allowedToPublish({type:'channel'}, {status:'administrator'}), false);
  assert.equal(allowedToPublish({type:'channel'}, {status:'member',can_post_messages:true}), false);
  assert.equal(allowedToPublish({type:'channel'}, {status:'creator'}), true);
  assert.equal(allowedToPublish({type:'private'}, {status:'creator'}), false);
});
test('groups require confirmed photo and message rights, respecting restrictions', () => {
  const chat={type:'supergroup',permissions:{can_send_messages:true,can_send_photos:true}};
  assert(allowedToPublish(chat,{status:'administrator'}));
  assert(allowedToPublish(chat,{status:'member'}));
  assert(!allowedToPublish({type:'group'},{status:'member'}));
  assert(!allowedToPublish(chat,{status:'restricted',is_member:true,can_send_messages:true,can_send_photos:false}));
  assert(allowedToPublish(chat,{status:'restricted',is_member:true,can_send_messages:true,can_send_photos:true}));
  assert(!allowedToPublish(chat,{status:'left'}));
});
test('only read methods are called, aliases are deduplicated and chat errors are isolated', async () => {
  const methods=[]; let members=0;
  const fetcher=async (url,options) => {
    const method=url.split('/').at(-1); methods.push(method);
    const params=JSON.parse(options.body);
    let payload;
    if(method==='getMe') payload={ok:true,result:{id:42,is_bot:true,username:'ExampleBot',first_name:'not in report'}};
    else if(method==='getChat' && params.chat_id==='@missing') payload={ok:false,error_code:400,description:'private-token-leak'};
    else if(method==='getChat') payload={ok:true,result:{id:-1001,type:'channel',title:'Channel',username:'one',linked_chat_id:-1002,description:'not in report'}};
    else if(method==='getChatMember') { members++;payload={ok:true,result:{status:'administrator',can_post_messages:true,user:{first_name:'private'}}}; }
    else throw new Error('A write method was attempted');
    return new Response(JSON.stringify(payload),{status:200});
  };
  const report=await inspectTelegramDestinations('secret-token',{fetcher,destinations:['one','@alias','missing','one']});
  assert.equal(report.destinations.length,3);
  assert.equal(members,1);
  assert.deepEqual([...new Set(methods)].sort(),['getChat','getChatMember','getMe']);
  assert.equal(report.destinations[0].linkedChatId,-1002);
  assert.equal(report.destinations[1].aliasOf,'one');
  assert.equal(report.destinations[1].allowedToPublish,true);
  assert.equal(report.destinations[2].error,'getChat failed (400)');
  assert(!JSON.stringify(report).includes('private'));
  assert(!JSON.stringify(report).includes('secret-token'));
  assert(!JSON.stringify(report).includes('not in report'));
});
test('network errors cannot expose request URL or bot token', async () => {
  let calls=0;
  const report=await inspectTelegramDestinations('secret-token',{destinations:['one'],fetcher:async()=>{
    if(calls++===0) return new Response(JSON.stringify({ok:true,result:{id:42,is_bot:true,username:'ExampleBot'}}));
    throw new Error('https://api.telegram.org/botsecret-token/getChat');
  }});
  assert.equal(report.destinations[0].error,'getChat unavailable');
  assert(!JSON.stringify(report).includes('secret-token'));
});
