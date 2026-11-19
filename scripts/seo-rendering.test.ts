import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Reveal from '../components/Reveal';
import Catalog from '../components/Catalog';
import CatalogPage from '../app/vakansii/page';
import VacancyPage, { generateMetadata } from '../app/vakansiya/[id]/page';
import JsonLd from '../components/JsonLd';
import Zarplatomir from '../components/Zarplatomir';
import ZarplatomirPage from '../app/zarplatomir/page';
import { canPublishJobPosting, workplace } from '../lib/vacancy-facts';
import { ALL_VACANCIES, CATEGORIES, getActiveVacancies, salaryFmt } from '../lib/data';

test('Reveal server markup keeps content visible before JavaScript', () => {
  const html = renderToStaticMarkup(createElement(Reveal, { children: 'Visible vacancy' }));
  assert.match(html, /Visible vacancy/);
  assert.doesNotMatch(html, /opacity:\s*0(?:[;" ]|$)|visibility:\s*hidden|display:\s*none/);
});

function catalogItemList(node: unknown): { '@type'?: string; itemListElement?: unknown[] } | undefined {
  if (Array.isArray(node)) return node.map(catalogItemList).find(Boolean);
  if (!node || typeof node !== 'object' || !('props' in node)) return undefined;
  const element = node as ReactElement<{ children?: unknown; itemList?: { '@type'?: string; itemListElement?: unknown[] } }>;
  return element.type === Catalog ? element.props.itemList : catalogItemList(element.props.children);
}

test('catalogue receives a bounded default list for reactive client-side schema visibility', async () => {
  for (const filter of [{}, { q: 'водій' }, { cat: 'transport' }, { type: 'SHIFT' }, { exp: '1' }]) {
    const list = catalogItemList(await CatalogPage({ searchParams: Promise.resolve(filter) }));
    assert.equal(list?.['@type'], 'ItemList');
    assert.ok(list?.itemListElement?.length && list.itemListElement.length <= 25);
  }
});

test('vacancy canonical IDs resolve while numeric URL aliases return 404', async () => {
  const id = String(ALL_VACANCIES[0].id);
  assert.equal((await generateMetadata({ params: Promise.resolve({ id }) })).alternates?.canonical, `/vakansiya/${id}`);
  for (const alias of [`0${id}`, `${id}.0`, `+${id}`, `${id}e0`]) {
    await assert.rejects(() => VacancyPage({ params: Promise.resolve({ id: alias }) }), /NEXT_HTTP_ERROR_FALLBACK;404/);
    assert.equal((await generateMetadata({ params: Promise.resolve({ id: alias }) })).alternates, undefined);
  }
});

function jobPosting(node: unknown): Record<string, unknown> | undefined {
  if (Array.isArray(node)) return node.map(jobPosting).find(Boolean);
  if (!node || typeof node !== 'object' || !('props' in node)) return undefined;
  const { type, props } = node as ReactElement<{ children?: unknown; data?: Record<string, unknown> }>;
  return type === JsonLd && props.data?.['@type'] === 'JobPosting' ? props.data : jobPosting(props.children);
}

test('JobPosting keeps the job identity and location without inferring a base salary', async (t) => {
  const now = Date.parse('2026-11-16T12:00:00Z');
  t.mock.method(Date, 'now', () => now);
  const vacancy = getActiveVacancies(now).find(v => canPublishJobPosting(v) && v.salary[0] > 0);
  assert.ok(vacancy);
  const page = await VacancyPage({ params: Promise.resolve({ id: String(vacancy.id) }) });
  const schema = jobPosting(page);
  assert.ok(schema);
  assert.equal(schema.title, vacancy.title);
  assert.equal(schema.datePosted, vacancy.date);
  assert.equal(schema.url, `https://robota-smila.com.ua/vakansiya/${vacancy.id}`);
  assert.deepEqual(schema.identifier, { '@type': 'PropertyValue', name: vacancy.company, value: String(vacancy.id) });
  assert.equal((schema.hiringOrganization as { name: string }).name, vacancy.company);
  assert.equal((schema.jobLocation as { address: { addressLocality: string } }).address.addressLocality, workplace(vacancy));
  assert.ok(!Object.hasOwn(schema, 'baseSalary'));
});

function salaryTool(node: unknown): ReactElement | undefined {
  if (Array.isArray(node)) return node.map(salaryTool).find(Boolean);
  if (!node || typeof node !== 'object' || !('props' in node)) return undefined;
  const element = node as ReactElement<{ children?: unknown }>;
  return element.type === Zarplatomir ? element : salaryTool(element.props.children);
}

test('salary tool renders linked individual active offers in server HTML', (t) => {
  const now = Date.parse('2026-11-16T12:00:00Z');
  t.mock.method(Date, 'now', () => now);
  const category = CATEGORIES[0];
  const paid = getActiveVacancies(now).filter(v => v.cat === category.slug && v.salary[1] > 0);
  assert.ok(paid.length, 'expected paid vacancies in the default category at the fixture date');
  const visible = paid.slice(0, 5);
  const component = salaryTool(ZarplatomirPage());
  assert.ok(component);
  const html = renderToStaticMarkup(component);
  assert.match(html, new RegExp(`Показано ${visible.length} із ${paid.length} оголошень`));
  assert.match(html, /Період оплати, базову ставку й доплати/);
  assert.doesNotMatch(html, /Середня зарплата у вибірці/);
  const entries = [...html.matchAll(/<li[^>]*>[\s\S]*?<\/li>/g)].map(match => match[0]);
  assert.equal(entries.length, visible.length);
  for (const [i, vacancy] of visible.entries()) {
    assert.ok(entries[i].includes(`href="/vakansiya/${vacancy.id}"`));
    assert.ok(entries[i].includes(salaryFmt(vacancy.salary)));
  }
});

test('salary tool retains a category link when it has no priced offers', () => {
  const html = renderToStaticMarkup(createElement(Zarplatomir, { vacancies: [] }));
  assert.match(html, /Немає вакансій із зазначеною оплатою/);
  assert.doesNotMatch(html, /href="\/vakansiya\//);
  assert.ok(html.includes(`href="/vakansii/${CATEGORIES[0].slug}"`));
});

// Supply the same public routing contexts used by Next when rendering client components on the server.
import { SearchParamsContext, PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import VacCard from '../components/VacCard';

function catalogueMarkup(vacancies = getActiveVacancies(), query = '') {
  return renderToStaticMarkup(createElement(PathnameContext.Provider, { value: '/vakansii' },
    createElement(SearchParamsContext.Provider, { value: new URLSearchParams(query) },
      createElement(Catalog, { vacancies, categories: CATEGORIES, itemList: {} }))));
}

test('catalogue exposes native links to populated category pages without replacing filters', () => {
  const vacancies = getActiveVacancies();
  const html = catalogueMarkup(vacancies);
  for (const category of CATEGORIES) {
    if (vacancies.some(v => v.cat === category.slug)) assert.ok(html.includes(`href="/vakansii/${category.slug}"`), category.slug);
  }
  assert.match(html, /<details/);
  assert.match(html, /type="checkbox"/);
  const onlyDrivers = vacancies.filter(v => v.cat === 'voditel');
  assert.ok(onlyDrivers.length);
  const sparse = catalogueMarkup(onlyDrivers);
  assert.ok(sparse.includes('href="/vakansii/voditel"'));
  assert.ok(!sparse.includes('href="/vakansii/ohorona"'));
});

test('catalogue cards and filters are visible in server HTML before JavaScript', () => {
  const html = catalogueMarkup(getActiveVacancies().slice(0, 2));
  assert.match(html, /<article/);
  assert.doesNotMatch(html, /opacity:\s*0(?:[;" ]|$)|visibility:\s*hidden|display:\s*none/);
});

test('shared vacancy card remains visible before its scroll animation runs', () => {
  const html = renderToStaticMarkup(createElement(PathnameContext.Provider, { value: '/vakansii/voditel' },
    createElement(VacCard, { v: getActiveVacancies()[0] })));
  assert.match(html, /<article/);
  assert.doesNotMatch(html, /opacity:\s*0(?:[;" ]|$)|visibility:\s*hidden|display:\s*none/);
});
