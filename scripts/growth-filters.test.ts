import test from 'node:test';
import assert from 'node:assert/strict';
import { VACANCIES } from '../lib/data';
import { mentionsBooking, meetsSalaryMinimum } from '../lib/vacancy-facts';
import { readCatalogFilters, writeCatalogFilters } from '../lib/catalog-filters';
import { payroll } from '../lib/payroll';

test('salary threshold uses lower bound and excludes negotiated or upper-only offers', () => {
  const base = VACANCIES[0];
  for (const [salary, expected] of [[[15000,30000],false], [[20000,25000],true], [[0,30000],false], [[0,0],false]] as const) {
    assert.equal(meetsSalaryMinimum({...base, salary:[...salary]},20000), expected);
  }
});
test('booking requires an explicit positive source statement and rejects negation', () => {
  const base = {...VACANCIES[0],short:'',duties:[],req:[],offer:[]};
  for (const [text, expected] of [['Можливість бронювання працівників',true],['Наявність бронювання.',true],['Не надаємо бронювання',false],['Можливість бронювання відсутня',false],['Бронювання квитків',false],['Можливість бронювання: ні',false],['Можливість бронювання недоступна',false],['Пропонуємо бронювання квитків',false]] as const) {
    assert.equal(mentionsBooking({...base,offer:[text]}),expected,text);
  }
});
test('growth filters survive sharing without overwriting attribution', () => {
  const params=writeCatalogFilters(new URLSearchParams('utm_source=tg&cat=vodiy'), 'min_salary',['20000']);
  const next=writeCatalogFilters(params,'booking',['1']);
  const state=readCatalogFilters(next,['vodiy']);
  assert.equal(state.minSalary,20000); assert.equal(state.booking,true); assert.equal(next.get('utm_source'),'tg');
  for(const invalid of ['-10','NaN','Infinity','1e4','20000.5','99999999']) assert.equal(readCatalogFilters(new URLSearchParams(`min_salary=${invalid}`),[]).minSalary,0);
});
test('standard payroll handles gross/net, cents, zero and invalid values',()=>{
  assert.deepEqual(payroll(20000),{gross:20000,income:3600,military:1000,net:15400});
  assert.deepEqual(payroll(15400,'net'),payroll(20000));
  assert.deepEqual(payroll(0),{gross:0,income:0,military:0,net:0});
  for(const invalid of [-1,NaN,Infinity,10000001]) assert.equal(payroll(invalid),null);
  assert.equal(payroll(12345.67)?.net,9506.17);
});
