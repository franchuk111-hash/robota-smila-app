import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ReactElement } from 'react';
import Home, { metadata } from '../app/page';
import JsonLd from '../components/JsonLd';
import { organizationLd } from '../lib/seo';
import { SITE_NAME, HOME_TITLE, HOME_DESCRIPTION } from '../lib/site-metadata';

function elements(node: unknown): ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as ReactElement<Record<string, unknown>>;
  return [element, ...elements(element.props.children)];
}

test('home has a specific title and matching search/social descriptions', () => {
  assert.deepEqual(metadata.title, { absolute: HOME_TITLE });
  assert.equal(metadata.description, HOME_DESCRIPTION);
  assert.ok(Array.from(HOME_TITLE).length <= 60);
  assert.ok(Array.from(HOME_DESCRIPTION).length <= 165);
  assert.equal(metadata.alternates?.canonical, '/');
  assert.equal((metadata.openGraph as { title: string }).title, HOME_TITLE);
  assert.equal((metadata.twitter as { description: string }).description, HOME_DESCRIPTION);
});

test('home website identity links to its real publisher without duplicate WebSite nodes', () => {
  const schemas = elements(Home()).filter(e => e.type === JsonLd).map(e => e.props.data as Record<string, unknown>);
  const sites = schemas.filter(s => s['@type'] === 'WebSite');
  assert.equal(sites.length, 1);
  assert.equal(sites[0].name, SITE_NAME);
  assert.equal(sites[0].url, 'https://robota-smila.com.ua/');
  assert.deepEqual(sites[0].publisher, { '@id': organizationLd['@id'] });
});

test('only changing homepage vacancy cards are excluded from snippet extraction', () => {
  const excluded = elements(Home()).filter(e => e.props['data-nosnippet'] !== undefined);
  assert.equal(excluded.length, 1);
  assert.equal(excluded[0].props.className, 'grid3');
  assert.equal(elements(excluded[0]).filter(e => typeof e.type === 'string' && /^(main|section)$/.test(e.type)).length, 0);
});
