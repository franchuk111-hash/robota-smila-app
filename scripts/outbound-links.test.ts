import assert from "node:assert/strict";
import { GET, HEAD } from "../app/go/[id]/route";
import { ALL_VACANCIES } from "../lib/data";
import { getOutboundHref, getVacancySourceHref, OUTBOUND_DESTINATIONS, isTelegramDestination, normalizeSource, telegramTrackedDestination } from "../lib/outbound-links";

async function main() {
  const request = new Request("https://robota-smila.com.ua/go/test?url=https://evil.example");
  const responseFor = (id: string) => GET(request, { params: Promise.resolve({ id }) });
  let checked = 0;
  for (const [id, destination] of Object.entries(OUTBOUND_DESTINATIONS)) {
    assert.equal(getOutboundHref(destination), isTelegramDestination(destination) ? `/go/${id}/?s=home` : `/go/${id}`);
    const response = await responseFor(id);
    assert.equal(response.status, 302);
    const location = new URL(response.headers.get("location")!);
    if (isTelegramDestination(destination)) {
      assert.equal(location.origin + location.pathname, destination);
      assert.equal(location.searchParams.get("utm_source"), "robota-smila");
      assert.equal(location.searchParams.get("utm_medium"), "referral");
      assert.equal(location.searchParams.get("utm_content"), "unknown");
      assert.match(location.searchParams.get("rtk")!, /^[0-9a-f-]{36}$/);
    } else assert.equal(location.href, destination);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
    checked++;
  }
  assert.equal(getOutboundHref("https://t.me/robota_smila_ua/1363"), "/go/telegram-post-1363/?s=home");
  assert.equal(new URL((await responseFor("telegram-post-1363")).headers.get("location")!).pathname, "/robota_smila_ua/1363");
  for (const vacancy of ALL_VACANCIES.filter(v => v.sourceUrl)) {
    const response = await responseFor(getVacancySourceHref(vacancy.id).slice(4));
    assert.equal(response.status, 302, `source ${vacancy.id}`);
    assert.equal(response.headers.get("location"), new URL(vacancy.sourceUrl!).href);
    checked++;
  }
  for (const id of ["unknown", "__proto__", "constructor", "https://evil.example", "telegram-post-1/evil", "source-0", "source-9999999999999999"]) {
    const response = await responseFor(id);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("location"), null);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  assert.equal((await HEAD(request, { params: Promise.resolve({ id: "telegram-channel" }) })).status, 302);
  assert.equal(getOutboundHref("/vakansii"), "/vakansii");
  for (const url of ["https://evil.example", "//evil.example", "https://t.me.evil.example/robota_smila_ua"]) {
    assert.throws(() => getOutboundHref(url));
  }
  assert.equal(normalizeSource("/vakansii?q=private%40mail.com"), "vakansii");
  assert.equal(normalizeSource("/private-name"), "unknown");
  assert.equal(normalizeSource("person@example.com"), "unknown");
  assert.equal(getOutboundHref("https://t.me/robota_smila_ua", "/vakansii"), "/go/telegram-channel/?s=vakansii");
  const token = "87f92845-c233-4acb-a831-6340d022b399";
  const tracked = await GET(new Request(`https://robota-smila.com.ua/go/telegram-channel/?s=vakansii&rtk=${token}&url=https://evil.example`), { params: Promise.resolve({id:"telegram-channel"}) });
  const location = new URL(tracked.headers.get("location")!);
  assert.equal(location.searchParams.get("rtk"), token);
  assert.equal(location.searchParams.get("utm_content"), "vakansii");
  assert.equal(location.searchParams.has("url"), false);
  const preserved = new URL(telegramTrackedDestination("https://t.me/robota_smila_ua?utm_source=original&subid=partner&text=Hello", "home", token));
  assert.equal(preserved.searchParams.get("utm_source"), "original");
  assert.equal(preserved.searchParams.get("subid"), "partner");
  assert.equal(preserved.searchParams.get("text"), "Hello");
  const fresh = new URL((await responseFor("telegram-channel")).headers.get("location")!).searchParams.get("rtk");
  assert.notEqual(fresh, location.searchParams.get("rtk"));
  console.log(`PASS outbound routing: ${checked} configured destinations, Telegram posts, HEAD, unknown ids and open-redirect rejection.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
