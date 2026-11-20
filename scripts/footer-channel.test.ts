import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import * as jsx from "react/jsx-runtime";
import * as outbound from "../lib/outbound-links";
import * as ga4 from "../lib/ga4";

type ElementNode = { type: unknown; props: { children?: unknown; href?: string; onClick?: () => void } };
const events: unknown[][] = [];
let consent = "declined";
Object.defineProperty(globalThis, "window", { configurable: true, value: { gtag: (...args: unknown[]) => events.push(args) } });
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => consent } });
const context = {
  exports: {},
  require: (name: string) => {
    if (name === "react/jsx-runtime") return jsx;
    if (name === "next/navigation") return { usePathname: () => "/vakansii" };
    if (name === "next/link") return { default: "a" };
    if (name.includes("outbound-links")) return outbound;
    if (name.includes("ga4")) return ga4;
    return { default: () => null };
  },
};
vm.runInNewContext(ts.transpileModule(readFileSync("components/Footer.tsx", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
}).outputText, context);
const links: ElementNode[] = [];
function visit(node: unknown) {
  if (Array.isArray(node)) return node.forEach(visit);
  if (!node || typeof node !== "object" || !("props" in node)) return;
  const element = node as ElementNode;
  if (element.props.href) links.push(element);
  visit(element.props.children);
}
visit((context.exports as { default: () => unknown }).default());
const channel = links.filter(link => link.props.href?.startsWith("/go/telegram-channel/"));
const admin = links.filter(link => link.props.href?.startsWith("/go/telegram-admin/"));
assert.equal(channel.length, 1);
assert.equal(admin.length, 1);
assert.equal(channel[0].props.href, "/go/telegram-channel/?s=vakansii");
assert.equal(outbound.getOutboundDestination("telegram-channel"), "https://t.me/robota_smila");
assert.equal(outbound.getOutboundDestination("telegram-admin"), "https://t.me/Smila_admin");
assert.equal(admin[0].props.onClick, undefined);
assert.ok(channel[0].props.onClick);
channel[0].props.onClick();
assert.equal(events.length, 0);
consent = "accepted";
channel[0].props.onClick();
assert.equal(events.length, 1);
assert.equal(events[0][0], "event");
assert.equal(events[0][1], "telegram_subscribe");
assert.equal((events[0][2] as { source: string }).source, "footer");
for (const href of ["/vakansii", "/rabotodavtsyam", "/pro-proiekt", "/polityka-konfidentsiynosti", "/umovy-korystuvannya", "/polityka-cookie", "/go/tiktok", "/go/youtube"]) {
  assert.ok(links.some(link => link.props.href === href), href);
}
console.log("PASS footer: channel/admin destinations, consent, one subscription event, preserved navigation");
