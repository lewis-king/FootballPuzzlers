# Football - Who am I?

A guess-the-player football quiz, first released in 2018 and relaunched in 2026 as an update to the same store listings. `~/Workspace/AGENTS.md` covers how Lewis works across projects. This file covers what is particular to this one.

## Where things are

| Folder | What it is |
|---|---|
| `mobile/` | The 2026 app (Expo). Its README covers store ids, version codes, building and the simulated store |
| `config/baseQuestions.json` | Every question in the app. `cd mobile && npm run questions` rebuilds the app's copy |
| `config/provenance/` | The audit trail behind each question, by id: what Lewis approved or edited and when, the fact-check claims with their quotes, clue-flag evidence, edits and sources (with the exact Wikipedia revision). Written by the auditor's `apply.py`; the app never reads it. Keep it when questions change |
| `question-factory/` | The question factory: drafts and fact-checks new packs with local models. Its rules are `question-factory/STYLE.md` |
| `tools/question-auditor/` | The click-through page where Lewis approves, edits or rejects questions |
| `site/` | footballwhoami.com (Cloudflare): the landing page and the privacy, terms and support pages |
| `workers/alerts/` | The push worker that tells players about new packs (alerts.footballwhoami.com) |
| `design/` | Figma notes (`figma.md`) and the art masters with their ComfyUI workflows |
| git tag `app-2019` | The original 2019 React Native app, removed from the tree in Nov 2026. `git checkout app-2019 -- <path>` restores a file if you ever need to look |

## Questions: what made the game, and the rules that keep it

Read `.claude/skills/question-builder/SKILL.md` and `question-factory/STYLE.md` before writing, editing or judging a question. In short:

- **Tricky and thought-provoking from question 1.** People loved the game because it made them think, so famous players still get a twist. Don't lead with the fact everyone knows; misdirect.
- **One headline fact at most.** A Ballon d'Or plus a national scoring record gives it away; keep the more intriguing one.
- **Don't over-specify.** "My nation's highest-scoring midfielder", not "Portuguese", when the detail leaves only two or three obvious names. Name a club only when it surprises. Same for qualifiers ("midfielder", not "defensive midfielder"); if the vaguer wording would be false, re-anchor it ("the first midfielder to win it since 2018").
- **A year is for records, not trophies.** "In 2026, I won the Premier League" just says "look up Arsenal's 2026 squad"; drop the year (Lewis's Trossard edit).
- **Anchor records to a year, not another player.** "Since 2018", not "since Modrić in 2018": naming him spoils his own question, now or in a future pack. Teammates and managers in the closing clue are fine.
- **Every name must add something.** Teammates and managers who all meet the player at one club only say "that club". Mix clubs, loans, national teams and surprising names.
- **Protect the "aha".** Don't give away a clue the guesser should spend on (position, retired, English), unless that fact is the twist.
- **A pack climbs** from famous players to real cult heroes at the end.
- **Fair and true, and built to last.** Every fact is sourced, and the wording stays true after the pack ships: tie records to a date, never "currently", and nothing relative to where the player is now ("my current league"). Caps are made, not won.
- **Clue flags follow How to Play.**
  - Wingers count as Midfielders.
  - A second position counts from a third (33%) of starts. Applies from the 2020s pack on; older packs keep the flags Lewis approved in Nov 2026.
  - English means born in England, with one exception: Sterling is yes.
  - Retired means retired as of the pack's date.
- **Answers include the plain spelling.** Every accented answer also gets its version without accents ("Bruno Guimarães, Guimarães, Bruno Guimaraes, Guimaraes"), as in the original packs: people leave accents out and must never be blocked for it. Surnames keep their particle (Van Dijk, De Bruyne, Mac Allister); names written surname first (Son Heung-min) take the real surname (Son). The app also forgives accents when checking, but the lists stay explicit.
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
