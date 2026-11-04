// Local preview only; no Telegram API calls or published-record changes.
import { mkdir, writeFile } from 'node:fs/promises';
import { ALL_VACANCIES } from '../lib/data';
import { renderVacancyCardPNG } from '../lib/vacancy-card';
import { vacancyPhotoCaption } from '../lib/telegram-vacancy';
async function main() {
  const id = Number(process.argv[2] || '1898377602');
  const v = ALL_VACANCIES.find(v => v.id === id);
  if (!v) throw new Error('Unknown vacancy ID');
  await mkdir('reports/telegram-preview', {recursive:true});
  await writeFile(`reports/telegram-preview/${id}.png`, await renderVacancyCardPNG(v));
  await writeFile(`reports/telegram-preview/${id}.html`, vacancyPhotoCaption(v));
  console.log(vacancyPhotoCaption(v));
  console.log(`\nImage: reports/telegram-preview/${id}.png; preview only, no sends.`);
}
main().catch(error => {console.error(error);process.exitCode=1;});
