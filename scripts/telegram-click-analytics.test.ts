import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
import vm from "node:vm";
const source = readFileSync("components/TelegramClickAnalytics.tsx", "utf8");
const handlers: Record<string, (event: unknown) => void> = {};
const events: unknown[][] = [];
const timers: (() => void)[] = [];
let consent: string | null = "declined";
class Element { closest() { return anchor; } }
class Anchor extends Element {
  href = "https://robota-smila.com.ua/go/telegram-channel/?s=home";
  getAttribute() { return this.href; }
  setAttribute(_name: string, value: string) { this.href = value; }
}
const anchor = new Anchor();
const context = {
  exports: {}, require: (name: string) => name === "react" ? {useEffect: (fn: () => void) => fn()} : name.includes("consent") ? {COOKIE_CONSENT_KEY:"rs_cookie_consent"} : {
    getOutboundDestination: () => "https://t.me/robota_smila_ua", isTelegramDestination: () => true, normalizeSource: (s: string) => s,
  },
  URL, Element, HTMLAnchorElement: Anchor, crypto, setTimeout: (fn: () => void) => timers.push(fn),
  window: {location:{origin:"https://robota-smila.com.ua"}, gtag: (...args: unknown[]) => events.push(args)},
  localStorage: {getItem: () => consent},
  document: {addEventListener: (name: string, fn: (event: unknown) => void) => handlers[name] = fn, removeEventListener() {}},
};
vm.runInNewContext(ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText, context);
(context.exports as {default: () => void}).default();
const click = () => { handlers.click({type:"click",button:0,target:anchor}); const href = anchor.href; timers.splice(0).forEach(fn=>fn()); return href; };
assert.ok(new URL(click(), context.window.location.origin).searchParams.get("rtk"));
assert.equal(events.length,0);
consent=null;
assert.doesNotThrow(click);
assert.equal(events.length,0);
consent="accepted";
const href = new URL(click(), context.window.location.origin);
assert.equal(events.length,1);
assert.equal((events[0][2] as {token:string}).token, href.searchParams.get("rtk"));
assert.equal(anchor.href,"https://robota-smila.com.ua/go/telegram-channel/?s=home");
context.window.gtag = undefined as unknown as typeof context.window.gtag;
assert.doesNotThrow(click);
context.window.gtag = () => { throw new Error("GA blocked"); };
assert.doesNotThrow(click);
context.localStorage.getItem = () => { throw new Error("Storage blocked"); };
assert.doesNotThrow(click);
console.log("PASS Telegram click analytics: consent, token parity, restored href, GA/storage failure does not block native links");
