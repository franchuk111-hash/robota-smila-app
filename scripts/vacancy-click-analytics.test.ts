import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { normalizeSource } from "../lib/outbound-links";

const events: unknown[][] = [];
const handlers: Record<string, (event: unknown) => void> = {};
let consent: string | null = null;
let cleanup: (() => void) | undefined;
class Element { closest() { return anchor; } }
class Anchor extends Element { href = "https://robota-smila.com.ua/vakansiya/1886116888"; }
const anchor = new Anchor();
const windowMock = { location: { origin: "https://robota-smila.com.ua", pathname: "/vakansii" }, gtag: (...args: unknown[]) => events.push(args) };
const storage = { getItem: () => consent };
const compile = (path: string) => ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const ga = { exports: {}, window: windowMock, localStorage: storage, require: () => ({ COOKIE_CONSENT_KEY: "rs_cookie_consent" }) };
vm.runInNewContext(compile("lib/ga4.ts"), ga);
const context = {
  exports: {}, URL, Element, HTMLAnchorElement: Anchor, window: windowMock,
  document: { addEventListener: (name: string, fn: (event: unknown) => void) => { handlers[name] = fn; }, removeEventListener: (name: string) => { delete handlers[name]; } },
  require: (name: string) => name === "react" ? { useEffect: (fn: () => () => void) => { cleanup = fn(); } } : name.includes("outbound-links") ? { normalizeSource } : ga.exports,
};
vm.runInNewContext(compile("components/VacancyClickAnalytics.tsx"), context);
(context.exports as { default: () => void }).default();
const click = (type = "click", button = 0) => handlers[type]({ type, button, target: new Element() });
for (const decision of [null, "declined", "invalid"]) { consent = decision; click(); }
assert.equal(events.length, 0);
consent = "accepted";
click();
assert.equal(events.length, 1, "a nested child activation emits once");
assert.equal(events[0][1], "select_vacancy");
assert.deepEqual(JSON.parse(JSON.stringify(events[0][2])), { vacancy_id: 1886116888, page_slug: "vakansii", page_location: "https://robota-smila.com.ua/vakansii", page_referrer: "", page_title: "Робота Сміла", transport_type: "beacon" });
windowMock.location.pathname = "/vakansiya/1886116888";
anchor.href = "https://robota-smila.com.ua/go/source-1886116888?private=not-collected";
click();
assert.equal(events[1][1], "vacancy_source_click");
assert.deepEqual(JSON.parse(JSON.stringify(events[1][2])), { vacancy_id: 1886116888, page_slug: "vakansiya/1886116888", page_location: "https://robota-smila.com.ua/vakansiya/1886116888", page_referrer: "", page_title: "Робота Сміла", transport_type: "beacon" });
const count = events.length;
for (const href of ["https://example.com/vakansiya/1", "https://robota-smila.com.ua/go/telegram-channel/", "https://robota-smila.com.ua/go/source-0", "https://robota-smila.com.ua/vakansiya/not-an-id", "https://robota-smila.com.ua/"]) { anchor.href = href; click(); }
assert.equal(events.length, count);
anchor.href = "https://robota-smila.com.ua/vakansiya/1886116888";
click("auxclick", 2); assert.equal(events.length, count);
click("auxclick", 1); assert.equal(events.length, count + 1);
cleanup?.(); assert.equal(Object.keys(handlers).length, 0);
(context.exports as { default: () => void }).default();
click(); assert.equal(events.length, count + 2, "remount replaces cleaned listeners; repeated intent emits one new event");
windowMock.location.pathname = "/private-personal-path";
click();
assert.equal((events.at(-1)?.[2] as { page_location: string }).page_location, "https://robota-smila.com.ua/");
assert.equal((events.at(-1)?.[2] as { page_slug: string }).page_slug, "unknown");
consent = "declined"; click(); assert.equal(events.length, count + 3);
storage.getItem = () => { throw new Error("blocked"); }; assert.doesNotThrow(click);
assert.equal(events.length, count + 3);
consent = "accepted"; storage.getItem = () => consent;
windowMock.gtag = undefined as unknown as typeof windowMock.gtag; assert.doesNotThrow(click);
windowMock.gtag = () => { throw new Error("GA blocked"); }; assert.doesNotThrow(click);
assert.equal(events.length, count + 3);
console.log("PASS vacancy click analytics: consent, nested single dispatch, source/detail separation, middle click, cleanup/remount, no raw URL/title/query fields");
