import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement, type ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Reveal from '../components/Reveal';
import JsonLd from '../components/JsonLd';
import CatalogPage from '../app/vakansii/page';
import VacancyPage, { generateMetadata } from '../app/vakansiya/[id]/page';
import { ALL_VACANCIES } from '../lib/data';

test('Reveal server markup keeps content visible before JavaScript', () => {
  const html = renderToStaticMarkup(createElement(Reveal, { children: 'Visible vacancy' }));
  assert.match(html, /Visible vacancy/);
  assert.doesNotMatch(html, /opacity:\s*0(?:[;" ]|$)|visibility:\s*hidden|display:\s*none/);
});

function hasItemList(node: unknown): boolean {
  if (Array.isArray(node)) return node.some(hasItemList);
  if (!node || typeof node !== 'object' || !('props' in node)) return false;
  const element = node as ReactElement<{ children?: unknown; data?: { '@type'?: string } }>;
  return (element.type === JsonLd && element.props.data?.['@type'] === 'ItemList') || hasItemList(element.props.children);
}

test('catalog only publishes its default ItemList without active URL filters', async () => {
  assert.equal(hasItemList(await CatalogPage({ searchParams: Promise.resolve({}) })), true);
  for (const filter of [{ q: 'водій' }, { cat: 'transport' }, { exp: '1' }]) {
    assert.equal(hasItemList(await CatalogPage({ searchParams: Promise.resolve(filter) })), false);
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
