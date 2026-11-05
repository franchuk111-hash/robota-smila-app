"use client";
import { useState } from 'react';
import { payroll } from '@/lib/payroll';

export default function PayrollCalculator() {
  const [value, setValue] = useState('20000');
  const [direction, setDirection] = useState<'gross' | 'net'>('gross');
  const result = value.trim() ? payroll(Number(value.replace(',', '.')), direction) : null;
  const money = (n: number) => `${n.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₴`;
  return <section className="zp" aria-labelledby="payroll-heading">
    <h2 id="payroll-heading">Калькулятор зарплати: нараховано та на руки</h2>
    <p>Орієнтовний розрахунок звичайної зарплати найманого працівника: ПДФО 18% і військовий збір 5%.</p>
    <label htmlFor="payroll-direction">Що ви знаєте?</label>
    <select id="payroll-direction" value={direction} onChange={e => setDirection(e.target.value as 'gross' | 'net')}>
      <option value="gross">Нараховану суму — розрахувати на руки</option>
      <option value="net">Суму на руки — розрахувати нараховану</option>
    </select>
    <label htmlFor="payroll-amount">{direction === 'gross' ? 'Нараховано' : 'Бажана сума на руки'}, ₴</label>
    <input id="payroll-amount" type="number" inputMode="decimal" min="0" max="10000000" step="0.01" value={value} onChange={e => setValue(e.target.value)} />
    <div className="result" role="status" aria-live="polite">
      {result ? <><div className="lbl">{direction === 'gross' ? 'На руки після утримань' : 'Орієнтовно нараховано'}</div>
        <div className="big">{money(direction === 'gross' ? result.net : result.gross)}</div>
        <p>Нараховано: {money(result.gross)}<br />ПДФО (18%): {money(result.income)}<br />Військовий збір (5%): {money(result.military)}<br />На руки: {money(result.net)}</p>
      </> : <p>Вкажіть суму від 0 до 10 000 000 ₴.</p>}
    </div>
    <p>Без податкової соціальної пільги, спеціальних режимів та інших утримань. Не підходить для ФОП, гіг-контрактів чи грошового забезпечення військовослужбовців. Зворотний розрахунок приблизний через округлення до копійок. Остаточний розрахунок уточнюйте в бухгалтерії.</p>
    <p>Ставки перевірено 5 листопада 2026 року. Джерела: <a href="https://www.tax.gov.ua/nk/rozdil-iv--podatok-na-dohodi-fizichnih-o/" target="_blank" rel="noopener noreferrer">ДПС: ПДФО</a>, <a href="https://lg.tax.gov.ua/media-ark/news-ark/1018180.html" target="_blank" rel="noopener noreferrer">ДПС: військовий збір</a>.</p>
  </section>;
}
