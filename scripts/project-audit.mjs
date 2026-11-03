// Read-only HTTP audit. External destinations are inventoried, never requested.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

const base = new URL(process.argv[2] || 'https://robota-smila.com.ua');
const output = process.argv[3] || 'reports/audit-20261103/crawl-production.json';
const canonicalOrigin = 'https://robota-smila.com.ua';
const unescape = value => value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const strip = value => unescape(value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
const attrs = tag => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)].map(m => [m[1].toLowerCase(), unescape(m[2] ?? m[3])]));
const failures = [];
const external = new Map();
const internals = new Map();
const resources = new Map();
const headers = response => Object.fromEntries(['content-type', 'content-security-policy', 'strict-transport-security', 'x-content-type-options', 'referrer-policy', 'x-frame-options', 'permissions-policy', 'x-robots-tag', 'cache-control', 'location'].map(key => [key, response.headers.get(key)]));
async function request(url, options = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    try { return await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(25000), ...options }); }
    catch (error) { if (attempt) throw error; }
  }
}
async function pool(items, task) {
  const queue = [...items];
  await Promise.all(Array.from({ length: 5 }, async () => { while (queue.length) await task(queue.shift()); }));
}
function classify(raw, page, kind) {
  if (!raw || /^(#|mailto:|tel:|javascript:|data:|blob:)/i.test(raw)) return;
  let url;
  try { url = new URL(raw, new URL(page, base)); } catch { failures.push({ page, issue: 'invalid-url', raw }); return; }
  if (!['http:', 'https:'].includes(url.protocol)) return;
  url.hash = '';
  const local = [base.origin, canonicalOrigin].includes(url.origin);
  if (!local) {
    if (kind === 'link') {
      const record = external.get(url.href) || { url: url.href, pages: new Set() };
      record.pages.add(page); external.set(url.href, record);
    }
    return;
  }
  const key = url.pathname + url.search;
  const collection = kind === 'link' ? internals : resources;
  const record = collection.get(key) || { path: key, pages: new Set() };
  record.pages.add(page); collection.set(key, record);
}
const sitemapResponse = await request(new URL('/sitemap.xml', base));
const sitemap = await sitemapResponse.text();
if (sitemapResponse.status !== 200) throw new Error(`Sitemap status ${sitemapResponse.status}`);
const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => new URL(unescape(m[1])).pathname);
const pages = [];
await pool(paths, async path => {
  try {
    const start = performance.now();
    const response = await request(new URL(path, base));
    const html = await response.text();
    const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => attrs(m[0]));
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(m => attrs(m[0]));
    const jsonLd = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(m => attrs(m[1]).type === 'application/ld+json').map(m => {
      try { return JSON.parse(m[2]); } catch { failures.push({ page: path, issue: 'invalid-jsonld' }); return null; }
    });
    const page = { path, status: response.status, title: strip(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] || ''), description: meta.find(m => m.name === 'description')?.content || '', h1: [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => strip(m[1])), canonical: links.find(l => l.rel === 'canonical')?.href || '', robots: meta.filter(m => ['robots','googlebot'].includes(m.name)).map(m => m.content), jsonLd, bytes: Buffer.byteLength(html), elapsedMs: Math.round(performance.now() - start), headers: headers(response) };
    if (page.status !== 200) failures.push({ page: path, issue: 'sitemap-status', value: page.status });
    if (!page.title) failures.push({ page: path, issue: 'missing-title' });
    if (!page.description) failures.push({ page: path, issue: 'missing-description' });
    if (page.h1.length !== 1) failures.push({ page: path, issue: 'h1-count', value: page.h1.length });
    let normalizedCanonical;
    try { normalizedCanonical = new URL(page.canonical).href; } catch { /* missing or invalid */ }
    if (normalizedCanonical !== new URL(path, canonicalOrigin).href) failures.push({ page: path, issue: 'canonical', value: page.canonical });
    if (page.robots.some(value => /noindex/i.test(value)) || /noindex/i.test(page.headers['x-robots-tag'] || '')) failures.push({ page: path, issue: 'sitemap-noindex' });
    if (path.startsWith('/go/')) failures.push({ page: path, issue: 'sitemap-redirect' });
    for (const match of html.matchAll(/<a\b[^>]*>/gi)) classify(attrs(match[0]).href, path, 'link');
    for (const match of html.matchAll(/<(?:script|img|source|video)\b[^>]*>/gi)) {
      const a = attrs(match[0]); classify(a.src, path, 'resource'); classify(a.poster, path, 'resource');
    }
    for (const l of links) if (['stylesheet', 'icon', 'apple-touch-icon', 'preload'].includes(l.rel)) classify(l.href, path, 'resource');
    pages.push(page);
  } catch (error) { failures.push({ page: path, issue: 'request', value: String(error) }); }
});
const pageStatuses = new Map(pages.map(p => [p.path, p.status]));
const checkedLinks = [];
await pool([...internals.values()], async record => {
  let status = pageStatuses.get(record.path);
  let location;
  try {
    if (status === undefined) { const response = await request(new URL(record.path, base)); status = response.status; location = response.headers.get('location'); await response.body?.cancel(); }
    if (!(status >= 200 && status < 400)) failures.push({ page: [...record.pages][0], issue: 'internal-link-status', target: record.path, value: status });
  } catch (error) { failures.push({ issue: 'internal-link-request', target: record.path, value: String(error) }); }
  checkedLinks.push({ path: record.path, status, location, placements: record.pages.size });
});
const checkedResources = [];
await pool([...resources.values()], async record => {
  let status;
  try {
    let response = await request(new URL(record.path, base), { method: 'HEAD' });
    if (response.status === 405) response = await request(new URL(record.path, base), { headers: { Range: 'bytes=0-0' } });
    status = response.status;
    await response.body?.cancel();
    if (!(status >= 200 && status < 400)) failures.push({ page: [...record.pages][0], issue: 'resource-status', target: record.path, value: status });
  } catch (error) { failures.push({ issue: 'resource-request', target: record.path, value: String(error) }); }
  checkedResources.push({ path: record.path, status, placements: record.pages.size });
});
const duplicates = field => {
  const map = new Map();
  for (const p of pages) if (p[field]) map.set(p[field], [...(map.get(p[field]) || []), p.path]);
  return [...map].filter(([, values]) => values.length > 1).map(([value, urls]) => ({ value, urls }));
};
const result = { checkedAt: new Date().toISOString(), base: base.origin, method: 'GET sitemap/pages/internal links; HEAD assets with GET Range fallback; manual redirects; external destinations not visited. Timings are crawler observations, not Core Web Vitals.', summary: { sitemapUrls: paths.length, uniqueSitemapUrls: new Set(paths).size, pagesChecked: pages.length, internalLinksChecked: checkedLinks.length, resourcesChecked: checkedResources.length, externalDestinations: external.size, failures: failures.length, duplicateTitleGroups: duplicates('title').length, duplicateDescriptionGroups: duplicates('description').length }, failures, duplicateTitles: duplicates('title'), duplicateDescriptions: duplicates('description'), pages: pages.sort((a,b) => a.path.localeCompare(b.path)), internalLinks: checkedLinks.sort((a,b) => a.path.localeCompare(b.path)), resources: checkedResources, externalLinks: [...external.values()].map(record => ({ url: record.url, pages: [...record.pages] })) };
await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(result, null, 2) + '\n');
await writeFile(output.replace(/\.json$/, '.md'), `# HTTP audit\n\nChecked: ${result.checkedAt}\nBase: ${base.origin}\n\n${Object.entries(result.summary).map(([k,v]) => `- ${k}: ${v}`).join('\n')}\n\n${result.method}\n\n## Findings\n\n${failures.map(f => '- ' + JSON.stringify(f)).join('\n') || 'None.'}\n`);
console.log(JSON.stringify(result.summary));
if (failures.length) process.exitCode = 1;
