import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const handlers: Record<string, () => void> = {};
let consent: string | null = null;
let allowed: unknown;
let cleanup: (() => void) | undefined;
const windowMock: Record<string, unknown> = {
  addEventListener: (name: string, fn: () => void) => { handlers[name] = fn; },
  removeEventListener: (name: string) => { delete handlers[name]; },
};
const storage = { getItem: () => consent };
const context = {
  exports: {}, window: windowMock, localStorage: storage,
  require: (name: string) => name === "react" ? {
    useState: () => [false, (value: unknown) => { allowed = value; }],
    useEffect: (fn: () => () => void) => { cleanup = fn(); },
  } : name.includes("consent") ? { COOKIE_CONSENT_KEY: "rs_cookie_consent", CONSENT_EVENT: "rs-consent-changed" } : {},
};
vm.runInNewContext(ts.transpileModule(readFileSync("components/Analytics.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText, context);
(context.exports as { default: () => void }).default();
const assertState = (expected: boolean) => {
  assert.equal(allowed, expected);
  assert.equal(windowMock["ga-disable-G-TRNR43ZLM5"], !expected);
};
assertState(false);
consent = "accepted"; handlers["rs-consent-changed"](); assertState(true);
consent = "declined"; handlers["rs-consent-changed"](); assertState(false);
consent = "accepted"; handlers.storage(); assertState(true);
consent = null; handlers.storage(); assertState(false);
consent = "invalid"; handlers.storage(); assertState(false);
storage.getItem = () => { throw new Error("Storage blocked"); };
assert.doesNotThrow(handlers.storage); assertState(false);
cleanup?.(); assert.equal(Object.keys(handlers).length, 0);
console.log("PASS analytics consent: initial denial, accept, revoke, cross-tab changes, invalid/blocked storage, listener cleanup");
