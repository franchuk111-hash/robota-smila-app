import { mkdir, writeFile } from 'node:fs/promises';
import { publishApprovedVacancies } from '../lib/approved-vacancy-publication';
async function main() {
  if(process.env.GITHUB_ACTIONS!=='true')throw new Error('Production queue runs only in the serialized release workflow');
  const results=await publishApprovedVacancies(process.env.TELEGRAM_BOT_TOKEN || '');
  await mkdir('reports',{recursive:true});
  await writeFile('reports/approved-telegram-publication.json',JSON.stringify({checkedAt:new Date().toISOString(),results},null,2)+'\n');
  console.log(`Approved manual vacancies checked: ${results.length}`);
}
main().catch(()=>{console.error('Approved Telegram publication incomplete; inspect saved primary/channel receipts before retrying');process.exitCode=1;});
