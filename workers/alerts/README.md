# New-pack alerts worker

Stores the Expo push tokens of players who tapped **Notify me**, and sends one notification when a new pack ships. The app posts to it from `mobile/src/services/alerts.native.ts` when `EXPO_PUBLIC_ALERTS_URL` is set.

Live at **https://alerts.footballwhoami.com** (deployed 20 Nov 2026, KV namespace `27984db0776a40579c2ee967794e5a9f`). The send secret is in `~/.config/fwai/alerts-send-secret` on Lewis's machine; copy it into a password manager too. The app gets the URL from `mobile/.env`.

Setup (already done once; repeat only on a new account):
1. `npx wrangler kv namespace create TOKENS`, then paste the id into `wrangler.toml`.
2. `npx wrangler secret put SEND_SECRET` (any long random string; keep it in your password manager).
3. `npx wrangler deploy`, then set `EXPO_PUBLIC_ALERTS_URL` to the worker URL in the EAS build env.

Push also needs, before the first store build: an EAS project id (`eas init`), FCM V1 credentials uploaded to EAS for Android, and an APNs key for iOS (EAS can make this on the first iOS build).

Announcing a pack, after the release with it is live in both stores:
```
ALERTS_URL=https://alerts.footballwhoami.com SEND_SECRET=$(cat ~/.config/fwai/alerts-send-secret) ./send.sh thirties "New pack: The 2030s" "60 new players to guess. Update the app to play." --dry-run
ALERTS_URL=... SEND_SECRET=... ./send.sh thirties "New pack: The 2030s" "60 new players to guess. Update the app to play."
```
The dry run prints how many phones would get it.

## Wording a pack announcement

The new pack only exists after the player updates, so say so: "60 new players to guess. Update the app to play." Tapping the notification on a version without the pack opens the App Store or Play Store page; on a version with it, the app opens at home.
