import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

async function main() {
  const handlers: Record<string, (event: any) => void> = {};
  const cached = new Map<string, Response>();
  const removed: string[] = [];
  let networkCalls = 0;
  let responseHeaders: Record<string, string> = {};
  const cache = {
    match: async (request: Request) => cached.get(request.url)?.clone(),
    put: async (request: Request, response: Response) => { cached.set(request.url, response); },
    addAll: async () => {},
  };
  vm.runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
    URL,
    self: {
      location: { origin: 'https://robota-smila.com.ua' },
      addEventListener: (name: string, handler: (event: any) => void) => { handlers[name] = handler; },
      skipWaiting() {}, clients: { claim() {} },
    },
    caches: {
      open: async () => cache,
      match: cache.match,
      keys: async () => ['robota-smila-v2', 'unrelated-app'],
      delete: async (key: string) => { removed.push(key); },
    },
    fetch: async () => {
      networkCalls++;
      return new Response('network-' + networkCalls, { headers: responseHeaders });
    },
  });
  async function dispatch(path: string, options: { mode?: string; headers?: Record<string, string> } = {}) {
    let response: Promise<Response> | undefined;
    const pending: Promise<unknown>[] = [];
    const request = {
      url: new URL(path, 'https://robota-smila.com.ua').href,
      method: 'GET', mode: options.mode || 'cors', headers: new Headers(options.headers),
    };
    handlers.fetch({ request, respondWith: (value: Promise<Response>) => { response = value; }, waitUntil: (value: Promise<unknown>) => pending.push(value) });
    const result = response ? await response : undefined;
    await Promise.all(pending);
    return result;
  }
  for (const path of ['/api/auth/session', '/api/auth/csrf', '/api/subscribers', '/go/telegram', '/profil', '/uvijty', 'https://other.example/icon.svg']) {
    assert.equal(await dispatch(path), undefined, `must bypass ${path}`);
  }
  assert.equal(await dispatch('/', { mode: 'navigate' }), undefined);
  assert.equal(await dispatch('/_next/static/test.js', { headers: { RSC: '1' } }), undefined);
  assert.equal(await dispatch('/_next/static/test.js?_rsc=token'), undefined);
  const first = await dispatch('/_next/static/test.js');
  const second = await dispatch('/_next/static/test.js');
  assert.equal(await first!.text(), await second!.text());
  assert.equal(networkCalls, 1, 'public static assets use cache');
  for (const policy of ['no-store', 'private, max-age=60', 'no-cache']) {
    responseHeaders = { 'Cache-Control': policy };
    const path = '/_next/static/' + encodeURIComponent(policy) + '.js';
    await dispatch(path);
    assert.equal(cached.has(new URL(path, 'https://robota-smila.com.ua').href), false, policy);
  }
  responseHeaders = { 'Content-Type': 'text/x-component' };
  await dispatch('/_next/static/rsc.js');
  assert.equal(cached.has('https://robota-smila.com.ua/_next/static/rsc.js'), false);
  let activation: Promise<unknown> | undefined;
  handlers.activate({ waitUntil: (value: Promise<unknown>) => { activation = value; } });
  await activation;
  assert.deepEqual(removed, ['robota-smila-v2'], 'evict old own cache and preserve other applications');
  console.log('PASS: auth/API/redirect/navigation/cross-origin/RSC bypass, public static cache, cache directives and old-cache cleanup.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
