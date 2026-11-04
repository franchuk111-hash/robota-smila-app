import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Reveal from '../components/Reveal';
import Catalog from '../components/Catalog';
import CatalogPage from '../app/vakansii/page';
import VacancyPage, { generateMetadata } from '../app/vakansiya/[id]/page';
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
