import assert from 'node:assert/strict';
import { test } from 'node:test';
import { vacancyCategory } from '../lib/vacancy-category';

test('driver occupation does not match the end of pipeline job titles', () => {
  for (const title of ['слюсар з експлуатації та ремонту підземних газопроводів', 'слюсар-монтажник технологічних трубопроводів']) {
    assert.equal(vacancyCategory(title, 'Транспорт').cat, 'robitnyk');
  }
  for (const title of ['Водій', 'водій-експедитор', 'Помічник водія', 'Водитель категорії C']) {
    assert.equal(vacancyCategory(title).cat, 'voditel');
  }
});

test('occupations remain distinct from the upstream industry', () => {
  assert.equal(vacancyCategory('сторож', 'Транспорт').cat, 'ohorona');
  for (const title of ['електромонтер контактної мережі', 'Укладальник-пакувальник', 'службовець на складі (комірник)']) {
    assert.equal(vacancyCategory(title, 'Транспорт').cat, 'robitnyk');
  }
});

test('role wins over a shop name and generic worker wording', () => {
  assert.equal(vacancyCategory('Продавець-касир в магазин "Будівельник"').cat, 'prodavets');
  assert.equal(vacancyCategory('Будівельний робітник').cat, 'budivnyctvo');
  assert.equal(vacancyCategory('Фахівець з продажу тканин').cat, 'office');
});
