#!/bin/bash
# Proposed replacement for ~/.hermes/scripts/robota_smila_deploy.sh.
# Installing this file does not resume or change any scheduler.
set -euo pipefail

REPO="${ROBOTA_DEPLOY_REPO:-$HOME/robota-smila-app}"
STATE_DIR="$HOME/.hermes/state"
STATE="$STATE_DIR/robota_smila_deployed_source_sha"
LOCK="$STATE_DIR/robota_smila_deploy.lock"
mkdir -p "$STATE_DIR"
if ! mkdir "$LOCK" 2>/dev/null; then
  echo "robota-smila: another local release owns the lock; skipping"
  exit 0
fi
WORK=$(mktemp -d "${TMPDIR:-/tmp}/robota-smila-release.XXXXXX")
trap 'rm -rf "$WORK"; rmdir "$LOCK"' EXIT
cd "$REPO"
# Preserve unrelated untracked notes; tracked modifications make a release unsafe.
test -z "$(git status --porcelain --untracked-files=no -- . ':(exclude)reports/**')" || { echo 'robota-smila: tracked edits prevent automatic release'; exit 1; }
test "$(git branch --show-current)" = main || { echo 'robota-smila: automatic release requires main'; exit 1; }
case "$(git remote get-url origin)" in
  https://github.com/franchuk111-hash/robota-smila-app.git|git@github.com:franchuk111-hash/robota-smila-app.git) ;;
  *) echo 'robota-smila: unexpected source repository'; exit 1 ;;
esac
cp data/collected-vacancies.json "$WORK/checkout-before.json"
git fetch origin main
git merge --ff-only --quiet origin/main
export ROBOTA_RELEASE_SHA
ROBOTA_RELEASE_SHA=$(git rev-parse HEAD)
test "$ROBOTA_RELEASE_SHA" = "$(git rev-parse origin/main)"
if [ -f "$STATE" ] && [ "$(cat "$STATE")" = "$ROBOTA_RELEASE_SHA" ]; then exit 0; fi
node scripts/release-guard.mjs --baseline "$WORK/checkout-before.json"

# Fail closed instead of replacing newer vacancies currently served on production.
curl --fail --silent --show-error --retry 2 --max-time 45 'https://robota-smila.com.ua/vakansii' -o "$WORK/catalog.html"
node --input-type=module - "$WORK/catalog.html" "$WORK/live-vacancies.json" <<'JS'
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync(process.argv[2], 'utf8');
const flight = [...html.matchAll(/<script>self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)]
  .map(match => JSON.parse(match[1])).filter(item => item[0] === 1).map(item => item[1]).join('');
const matches = [];
for (const line of flight.split('\n')) {
  if (!/^[\da-f]+:\[/.test(line)) continue;
  try { const node = JSON.parse(line.slice(line.indexOf(':') + 1)); if (Array.isArray(node?.[3]?.vacancies)) matches.push(node[3].vacancies); } catch {}
}
assert.equal(matches.length, 1, 'Complete live vacancy payload is required');
assert.ok(matches[0].length, 'Live vacancies must not be empty');
assert.equal(new Set(matches[0].map(v => v.id)).size, matches[0].length, 'Duplicate live IDs');
writeFileSync(process.argv[3], JSON.stringify(matches[0]));
JS
node scripts/release-guard.mjs --baseline "$WORK/live-vacancies.json"

# Archive the exact committed source and live baseline before publishing.
BACKUP="$STATE_DIR/robota-smila-releases/$(date -u +%Y%m%dT%H%M%SZ)-$ROBOTA_RELEASE_SHA"
mkdir -p "$BACKUP"
git archive --format=tar.gz --output="$BACKUP/source.tar.gz" "$ROBOTA_RELEASE_SHA"
cp "$WORK/live-vacancies.json" "$BACKUP/live-vacancies.before.json"
printf '%s\n' "$ROBOTA_RELEASE_SHA" > "$BACKUP/source-sha.txt"
npm ci
npm run typecheck
node --import tsx --test scripts/release-guard.test.mjs scripts/outbound-links.test.ts scripts/telegram-click-analytics.test.ts scripts/auth-availability.test.ts
# deploy runs the built guard; ROBOTA_RELEASE_SHA checks remote parity immediately
# before wrangler, after the build, and rejects tracked changes. Keep runtime vars.
npm run deploy 2>&1 | tee "$BACKUP/deploy.log"
# Record success only after the production routing/content smoke test passes.
mkdir -p reports
node --import tsx scripts/prepublish-smoke.ts https://robota-smila.com.ua --live
printf '%s\n' "$ROBOTA_RELEASE_SHA" > "$STATE.tmp"
mv "$STATE.tmp" "$STATE"
echo "robota-smila: published source $ROBOTA_RELEASE_SHA; backup $BACKUP"
