# Football - Who am I?

A guess-the-player football quiz, first released in 2018 and relaunched in 2026 as an update to the same store listings. `~/Workspace/AGENTS.md` covers how Lewis works across projects. This file covers what is particular to this one.

## Where things are

| Folder | What it is |
|---|---|
| `mobile/` | The 2026 app (Expo). Its README covers store ids, version codes, building and the simulated store |
| `config/baseQuestions.json` | Every question in the app. `cd mobile && npm run questions` rebuilds the app's copy |
| `factory/` | Drafts and fact-checks new questions with local models. Its rules are `factory/STYLE.md` |
| `tools/question-auditor/` | The click-through page where Lewis approves, edits or rejects questions |
| `site/` | footballwhoami.com (Cloudflare): the landing page and the privacy, terms and support pages |
| `workers/alerts/` | The push worker that tells players about new packs (alerts.footballwhoami.com) |
| `design/` | Figma notes (`figma.md`) and the art masters with their ComfyUI workflows |
| Repo root (`src/`, `android/`, `ios/`) | The 2019 React Native app, kept for reference only. Don't build it |

## Questions: what made the game, and the rules that keep it

Read `.claude/skills/question-builder/SKILL.md` and `factory/STYLE.md` before writing, editing or judging a question. In short:

- **Tricky and thought-provoking from question 1.** People loved the game because it made them think, so famous players still get a twist. Don't lead with the fact everyone knows; misdirect.
- **Every name must add something.** Teammates and managers who all meet the player at one club only say "that club". Mix clubs, loans, national teams and surprising names.
- **Protect the "aha".** Don't give away a clue the guesser should spend on (position, retired, English), unless that fact is the twist.
- **A pack climbs** from famous players to real cult heroes at the end.
- **Fair and true.** Every fact is sourced, and the wording stays true over time: tie records to a date, never "currently". Caps are made, not won.
- **Clue flags follow How to Play.**
  - Wingers count as Midfielders.
  - A second position counts from 25% of starts.
  - English means born in England, with one exception: Sterling is yes.
  - Retired means retired as of the pack's date.
- **Lewis approves the wording** of every question, through the auditor, before it reaches `baseQuestions.json`.
- **Ids are permanent.** Progress, the 2019 import and save codes all store them.

## Working rules

- **No Android emulator or adb.** They froze this machine. Test in the web build and with locally built APKs (the recipe is in the store-publishing skill).
- **Web isn't the phone.** Reanimated worklets (`useAnimatedStyle`) run on the UI thread on a device. Calling a plain JS function from one crashes the app on Android, yet works fine on web. Compute values outside the worklet.
- **Play a build through yourself** (phone and small-phone sizes) before handing it to Lewis.
- **Respect source rate limits.** The factory goes through `polite_http`. Never scrape transfermarkt.com; use the CC0 dataset.
- **Keep secrets out of the repo.** Store keys and the keystore live in `~/Workspace/.config/store-keys/`. `mobile/credentials.json` is git-ignored. Never print a key or password.
- **Keep Lewis's personal email off public pages.** Use hello@footballwhoami.com.
- **Commit only when asked.**
