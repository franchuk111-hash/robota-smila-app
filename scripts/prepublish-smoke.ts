import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { getActiveVacancies } from "../lib/data";
import { OUTBOUND_DESTINATIONS, isTelegramDestination, getOutboundDestination, normalizeSource } from "../lib/outbound-links";

async function main() {
  const base = new URL(process.argv[2] || "http://localhost:3137");
  const live = process.argv.includes("--live");
  assert.ok(["localhost", "127.0.0.1"].includes(base.hostname) || (live && base.origin === "https://robota-smila.com.ua"), "Use an explicit --live flag for the production domain");
  const failures: string[] = [];
  const check = (condition: unknown, description: string) => { if (!condition) failures.push(description); };
  const fetchPath = (path: string) => fetch(new URL(path, base), { redirect: "manual", signal: AbortSignal.timeout(20_000) });
  const sitemapResponse = await fetchPath("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
  check(new Set(paths).size === paths.length, "Duplicate sitemap paths");
  check(!paths.some(path => path.startsWith("/go/")), "Redirect routes in sitemap");
  for (const vacancy of getActiveVacancies()) check(paths.includes(`/vakansiya/${vacancy.id}`), `Active vacancy absent from sitemap: ${vacancy.id}`);
  const telegramInventory: {page: string; brand: string; href: string; destination: string}[] = [];
  const pending = paths.slice();
  await Promise.all(Array.from({ length: 6 }, async () => {
    while (pending.length) {
      const path = pending.shift()!;
      try {
        const response = await fetchPath(path);
        check(response.status === 200, `${path}: status ${response.status}`);
        const html = await response.text();
        check(/<h1\b/.test(html), `${path}: missing h1`);
        check(/<title>[^<]+<\/title>/.test(html), `${path}: missing title`);
        check(!/<meta[^>]+name="robots"[^>]+content="[^"]*noindex/.test(html), `${path}: sitemap page has noindex`);
        const canonical = /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/.exec(html)?.[1];
        check(!!canonical && new URL(canonical).pathname.replace(/\/$/, "") === path.replace(/\/$/, ""), `${path}: canonical mismatch`);
        const anchors = [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)];
        for (const [tag, href] of anchors) {
          check(!/^(https?:)?\/\/(?:t\.me|telegram\.me)(?:\/|$)/i.test(href), `${path}: direct Telegram anchor ${href}`);
          if (href.startsWith("/go/telegram-")) {
            const url = new URL(href.replace(/&amp;/g, "&"), base);
            const id = url.pathname.split("/")[2];
            const destination = getOutboundDestination(id);
            check(!!destination && isTelegramDestination(destination), `${path}: Telegram destination ${id}`);
            check(url.pathname.endsWith("/"), `${path}: Telegram route requires trailing slash`);
            check(url.searchParams.get("s") === normalizeSource(path), `${path}: Telegram source mismatch ${href}`);
            if (destination) telegramInventory.push({page:path, brand:id.startsWith("telegram-post-")?"telegram-channel":id, href, destination});
          }
          if (href.startsWith("/go/")) check(/rel="[^"]*nofollow/.test(tag), `${path}: outbound link lacks nofollow`);
        }
        for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
          try { JSON.parse(match[1]); } catch { failures.push(`${path}: invalid JSON-LD`); }
        }
      } catch (error) { failures.push(`${path}: ${String(error)}`); }
    }
  }));
  for (const [id, destination] of Object.entries(OUTBOUND_DESTINATIONS)) {
    const response = await fetchPath(`/go/${id}${isTelegramDestination(destination) ? "/" : ""}?s=home&url=https://invalid.example`);
    const location = new URL(response.headers.get("location") || "https://invalid.example");
    const expected = new URL(destination);
    check(response.status === 302 && (isTelegramDestination(destination)
      ? location.origin === expected.origin && location.pathname === expected.pathname && location.searchParams.get("utm_source") === "robota-smila" && location.searchParams.get("utm_content") === "home" && !!location.searchParams.get("rtk")
      : location.href === destination), `Redirect ${id}`);
    check(response.headers.get("cache-control")?.includes("no-store"), `Cache header ${id}`);
    check(response.headers.get("x-robots-tag")?.includes("noindex"), `Robots header ${id}`);
  }
  check((await (await fetchPath("/robots.txt")).text()).includes("Disallow: /go/"), "Missing /go/ robots exclusion");
  for (const path of ["/go/unknown", "/vakansiya/9999999999999999", "/vakansii/nonexistent-category"]) {
    check((await fetchPath(path)).status === 404, `${path}: expected 404`);
  }
  await writeFile(live ? "reports/telegram-live-inventory.json" : "reports/telegram-local-inventory.json", JSON.stringify({links:telegramInventory.length, destinations:[...new Set(telegramInventory.map(item=>item.destination))].sort(), placements:telegramInventory.sort((a,b)=>a.page.localeCompare(b.page)||a.href.localeCompare(b.href))},null,2)+"\n");
  const result = { telegramLinks:telegramInventory.length, checkedAt: new Date().toISOString(), base: base.origin, sitemapPages: paths.length, activeVacancies: getActiveVacancies().length, failures };
  await writeFile(live ? "reports/live-smoke.json" : "reports/prepublish-smoke.json", JSON.stringify(result, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
  assert.equal(failures.length, 0, "Prepublication HTTP checks failed");
}
main().catch(error => { console.error(error); process.exitCode = 1; });
