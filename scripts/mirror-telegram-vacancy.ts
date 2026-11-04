import { mkdir, writeFile } from 'node:fs/promises';
import { ALL_VACANCIES } from '../lib/data';
import { mirrorVacancy } from '../lib/telegram-mirrors';
async function main() {
  const id = Number(process.argv[2]);
  if (!Number.isSafeInteger(id)) throw new Error('Pass one approved vacancy ID');
  const vacancy = ALL_VACANCIES.find(v => v.id === id);
  if (!vacancy?.tgMsgId) throw new Error('The vacancy must already have a confirmed primary-group post');
  if (!process.env.TELEGRAM_BOT_TOKEN) throw new Error('Missing bot credential');
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_RUN_ATTEMPT !== '1') throw new Error('Check saved per-channel receipts before rerunning; use a fresh dispatch only after reconciliation');
  const results = await mirrorVacancy(vacancy, process.env.TELEGRAM_BOT_TOKEN, {persistGit:process.env.GITHUB_ACTIONS === 'true'});
  await mkdir('reports', {recursive:true});
  await writeFile('reports/telegram-mirrors.json', JSON.stringify({checkedAt:new Date().toISOString(),vacancyId:id,sourceMessageId:vacancy.tgMsgId,results},null,2)+'\n');
  console.log(JSON.stringify(results,null,2));
  if (results.some(row => !['disabled','published','already-published'].includes(row.status))) process.exitCode=1;
}
main().catch(error => {console.error(error instanceof Error ? error.message : 'Mirror operation failed');process.exitCode=1;});
