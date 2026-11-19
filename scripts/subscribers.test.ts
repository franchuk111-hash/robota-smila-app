import assert from "node:assert/strict";
import { GET } from "../app/api/subscribers/route";

async function main() {
  const originalFetch = globalThis.fetch;
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalChannel = process.env.TELEGRAM_CHANNEL_ID;
  try {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHANNEL_ID;
    assert.deepEqual(await (await GET()).json(), { count: null });
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    process.env.TELEGRAM_CHANNEL_ID = "@primary_group";
    let calls = 0;
    for (const result of [-1, 1.5, "100", null, Number.MAX_SAFE_INTEGER + 1]) {
      globalThis.fetch = async (url, init) => {
        calls++;
        assert.equal(new URL(String(url)).searchParams.get("chat_id"), "@robota_smila");
        assert.equal(init?.cache, "no-store"); assert.ok(init?.signal);
        return Response.json({ ok: true, result });
      };
      assert.deepEqual(await (await GET()).json(), { count: null });
    }
    globalThis.fetch = async () => Response.json({ ok: true, result: 123 }, { status: 500 });
    assert.deepEqual(await (await GET()).json(), { count: null });
    globalThis.fetch = async () => { throw new DOMException("Timeout", "TimeoutError"); };
    assert.deepEqual(await (await GET()).json(), { count: null });
    globalThis.fetch = async () => new Response("not json");
    assert.deepEqual(await (await GET()).json(), { count: null });
    globalThis.fetch = async (url) => {
      calls++;
      assert.equal(new URL(String(url)).searchParams.get("chat_id"), "@robota_smila");
      return Response.json({ ok: true, result: 0 });
    };
    const response = await GET();
    assert.deepEqual(await response.json(), { count: 0 });
    assert.equal(response.headers.get("cache-control"), "public, max-age=300");
    globalThis.fetch = async () => { throw new Error("Cache should avoid network"); };
    assert.deepEqual(await (await GET()).json(), { count: 0 });
    assert.equal(calls, 6);
    console.log("PASS subscribers: missing config, invalid counts, HTTP failure, timeout, malformed response, public channel independent of publishing group, real zero, cache; mocked Telegram only");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN; else process.env.TELEGRAM_BOT_TOKEN = originalToken;
    if (originalChannel === undefined) delete process.env.TELEGRAM_CHANNEL_ID; else process.env.TELEGRAM_CHANNEL_ID = originalChannel;
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
