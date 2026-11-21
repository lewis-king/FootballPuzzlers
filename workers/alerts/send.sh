#!/usr/bin/env bash
# Announce a new pack to everyone who opted in. Send only once the release with the pack is live
# in BOTH stores. <pack-id> is the id in mobile/src/lib/game.ts PACKS; older app versions that
# don't have it open the store page when the notification is tapped.
#   ALERTS_URL=https://alerts.footballwhoami.com SEND_SECRET=$(cat ~/.config/fwai/alerts-send-secret) \
#     ./send.sh thirties "New pack: The 2030s" "60 new players to guess. Update the app to play." [--dry-run]
set -euo pipefail
pack="$1"; title="$2"; body="$3"; dry=false
[[ "${4:-}" == "--dry-run" ]] && dry=true
jq -n --arg p "$pack" --arg t "$title" --arg b "$body" --argjson d "$dry" '{pack:$p, title:$t, body:$b, dryRun:$d}' |
  curl -sS -X POST "$ALERTS_URL/send" -H "authorization: Bearer $SEND_SECRET" -H 'content-type: application/json' --data-binary @-
echo
