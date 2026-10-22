import fs from 'node:fs';
import { addManualVacancies } from './manual-vacancies';
const file = process.argv[2];
if (!file) throw new Error('Вкажіть шлях до JSON-файлу масиву вакансій');
addManualVacancies(JSON.parse(fs.readFileSync(file, 'utf8')));
