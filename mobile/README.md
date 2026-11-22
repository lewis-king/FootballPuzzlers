# Football Who Am I (v3, Expo)

The rebuild of the 2019 React Native 0.57 app in the repo root. It ships as an **update** to the existing store listings, so the ids match the old app:

| | Value |
|---|---|
| Android package | `com.footballtrivia` |
| iOS bundle id | `com.king.FootballTrivia` |
| Pack products | `com.footballwhoami.worldcup_1`, `com.footballwhoami.championsleague_1` |
| Android versionCode | `3000000`. The 2019 builds split by CPU and used `abi × 1048576 + 26`, so Play has codes up to about 2,097,178; anything lower is rejected as a downgrade |
| iOS build | `31` (2019 was 2.2 build 30) |

Design: Figma file `pm3LBsGJW2PIdR4Exapawq`, notes in `../design/figma.md`.

## Commands

```bash
npm test                 # save code, 2019 Realm import, answer checking, streak
npm run typecheck
npx expo lint
npm run questions        # rebuild src/data/questions.json from ../config/baseQuestions.json
npx expo export --platform web   # quick visual check in a browser (ads and purchases are simulated)
```

## How it fits together

| Piece | Where |
|---|---|
| Screens (Expo Router) | `src/app/` |
| Questions, packs, clue rules, answer checking, streak | `src/lib/game.ts` |
| Progress store (zustand, persisted) | `src/state/progress.ts` |
| Save code (copy and paste, no server) | `src/lib/saveCode.ts` |
| Import of the 2019 Realm save | `src/lib/legacyRealm.ts`, `src/lib/findLegacySave.ts` |
| Ads (banner, interstitial every 4th correct answer, rewarded letter) | `src/services/ads.native.tsx` |
| Pack purchases (expo-iap, no server) | `src/services/purchases.native.ts` |

Web and tests use `ads.tsx` / `purchases.ts`, which simulate. Dev builds (`__DEV__`) and builds with `EXPO_PUBLIC_SIMULATE_STORE=1` use test ads and a simulated store.

### Question ids are permanent

Progress, the 2019 import and save codes all store question ids. Never change or reuse one; new questions take the next free id. The 2019 file had two questions on id 201: Realm kept the later one (Lucas Pérez), so Pérez stays 201 and Beckham moved to 212 (`scripts/build-questions.mjs`).

### The 2019 import

On first launch the app looks for Realm's `default.realm` in the documents directory (where realm-js 2.x put it on both platforms), reads answered questions, revealed clues and purchases with a small reader of the file format (no Realm dependency), merges them in, and shows Welcome back once. It never writes to the old file. Tested against a fixture made by realm-js 2.20 (`../tools/realm-legacy/`); still to test on a real phone with a 2019 install.

## Before release

- [x] Real Android AdMob app id in `app.json` (from the 2019 AndroidManifest). [x] Real iOS AdMob app id in `app.json` (from Lewis, 22 Nov 2026). The 2019 ad unit ids are already in `ads.native.tsx`.
- [ ] Confirm the support email (`src/services/config.ts`).
- [ ] Price both packs at £1.99 in the stores.
- [ ] Android upload keystore (`FootballWhoAmI-release-key.keystore`) for EAS, so the update is signed like the 2019 app.
- [ ] Test the 2019 import on a phone that has the old app with progress.
- [ ] 2020s pack questions and photo.
