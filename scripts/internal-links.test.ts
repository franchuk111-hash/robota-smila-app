import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { ReactElement } from 'react';
import VacancyPage from '../app/vakansiya/[id]/page';
import { ALL_VACANCIES, COMPANIES } from '../lib/data';
import { KNOWN_COMPANY_URLS } from '../lib/seo';

function elements(node: unknown): ReactElement<Record<string, unknown>>[] {
  if (Array.isArray(node)) return node.flatMap(elements);
  if (!node || typeof node !== 'object' || !('props' in node)) return [];
  const element = node as ReactElement<Record<string, unknown>>;
  return [element, ...elements(element.props.children)];
}

test('each vacancy links its employer name to the matching existing company profile', async () => {
  const slugs = new Set(COMPANIES.map(c => c.slug));
  assert.equal(slugs.size, COMPANIES.length, 'company routes must be unique');
  for (const vacancy of ALL_VACANCIES) {
    const tree = await VacancyPage({ params: Promise.resolve({ id: String(vacancy.id) }) });
    const company = COMPANIES.find(c => c.name === vacancy.company);
    assert.ok(company, `Missing company profile for vacancy ${vacancy.id}`);
    const employer = elements(tree).find(e => e.props.className === 'company');
    assert.ok(employer);
    const links = elements(employer).filter(e => e.props.href !== undefined);
    const profile = links.find(e => e.props.href === `/kompaniya/${company.slug}`);
    assert.ok(profile, `Missing employer link for vacancy ${vacancy.id}`);
    assert.equal(profile.props.children, vacancy.company);
    assert.equal(profile.props.target, undefined, 'company profiles open in the same tab');
    const corporateUrl = KNOWN_COMPANY_URLS[vacancy.company];
    if (corporateUrl) {
      const corporate = links.find(e => e.props.href === corporateUrl);
      assert.ok(corporate, `Corporate website lost for vacancy ${vacancy.id}`);
      assert.equal(corporate.props.target, '_blank');
      assert.equal(corporate.props.rel, 'noopener noreferrer');
      assert.equal(corporate.props['aria-label'], `Сайт компанії ${vacancy.company}`);
    } else {
      assert.equal(links.length, 1, 'do not invent corporate destinations');
    }
  }
});
