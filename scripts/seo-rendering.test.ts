import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Reveal from '../components/Reveal';
import Catalog from '../components/Catalog';
import CatalogPage from '../app/vakansii/page';
import VacancyPage, { generateMetadata } from '../app/vakansiya/[id]/page';
import JsonLd from '../components/JsonLd';
import { canPublishJobPosting } from '../lib/vacancy-facts';
import { ALL_VACANCIES } from '../lib/data';

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

test('JobPosting omits unverified base pay while retaining the listing', async () => {
  const now = Date.parse('2026-11-11T12:00:00Z');
  const vacancy = getActiveVacancies(now).find(v => canPublishJobPosting(v) && v.salary[0] > 0);
  assert.ok(vacancy);
  const realNow = Date.now;
  try {
    Date.now = () => now;
    const page = await VacancyPage({ params: Promise.resolve({ id: String(vacancy.id) }) });
    function jobPosting(node: unknown): Record<string, unknown> | undefined {
      if (Array.isArray(node)) return node.map(jobPosting).find(Boolean);
      if (!node || typeof node !== 'object' || !('props' in node)) return undefined;
      const { type, props } = node as ReactElement<{ children?: unknown; data?: Record<string, unknown> }>;
      return type === JsonLd && props.data?.['@type'] === 'JobPosting' ? props.data : jobPosting(props.children);
    }
    const schema = jobPosting(page);
    assert.equal(schema?.title, vacancy.title);
    assert.ok(schema && !Object.hasOwn(schema, 'baseSalary'));
  } finally {
    Date.now = realNow;
  }
});

// Supply the same public routing contexts used by Next when rendering client components on the server.
import { SearchParamsContext, PathnameContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';
import VacCard from '../components/VacCard';
import { CATEGORIES, getActiveVacancies } from '../lib/data';

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
