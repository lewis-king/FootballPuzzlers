---
name: question-builder
description: Write, check and add "Football - Who am I?" questions with the local factory (question-factory/). Covers the house style, how teammates and managers are chosen as clues, the fact-check and its evals, and Lewis's approval before anything reaches the app. Use when generating a new pack, editing questions or changing the fact-checker.
---

# Question builder

The factory drafts questions from sourced evidence, checks every fact with local models and data, and hands Lewis a review. Nothing goes into `config/baseQuestions.json` until Lewis has approved the wording.

## The style

`question-factory/STYLE.md` is the house style, and the writer model is given it word for word. Read it before changing prompts. In short, the player tells a bit of their story in the first person: a hook, a twist, then a clue that narrows it down.

## Teammates and managers are chosen, not listed

Most questions name people the player played with or under. They are clues, so:

- pick **well-known names**, or **surprising ones** you wouldn't link with the player (a loan, a spell abroad, the end of a career), so working out where they met is the puzzle;
- take them from **different clubs and stages** of the career;
- avoid the **one obvious partner** unless the rest is hard;
- make **every name add something**: names (managers included) that all meet the player at one club only say "that club" (Lewis on Foden: Guardiola, Haaland & De Bruyne is just Man City). `pack.lint` fails it;
- **check every pairing against squad data** (same club or national squad at the same time; played under the manager). A model's say-so isn't enough, because Wikipedia prose rarely lists teammates, and the November 2026 eval showed both checkers answering "not found" on nearly all of them.

## Tricky from question one

The main reason people loved the game is that it was tricky and made you think. Lewis's verdict on the first 2020s pass (21 Nov 2026): the first 15 were all straightforward, which loses the fun. So famous players still get a twist: don't lead with the fact everyone knows, misdirect, and make the lines add up. See `question-factory/STYLE.md`, "Tricky and thought-provoking"; the style judge caps a question at 3 if its first sentence gives the answer away. Lewis's edits on the second pass (21 Nov 2026) added three more: one headline fact at most (Kane: keep the Ballon d'Or, drop "highest scoring English player"), don't over-specify ("my nation's", not "Portuguese"), and nothing relative to where the player is now ("my current league"; `pack.lint` fails "current"). Then a fourth: anchor records to a year, not another player ("since 2018", not "since Modrić in 2018"), because naming him spoils his own question now or in a later pack. `from_factory.py` flags any other answer in the pack that a question names other than as a team-mate or manager. Lewis's own edits are the best teaching examples: put them in `STYLE.md` as before and after, and in `README.md` so people see them too.

## Packs get harder as you go

Lewis's packs open with players everyone knows and climb towards cult names and obscure facts, loosely rather than strictly (a famous name with a hard question can come late). Candidate lists need plenty of harder players, and `question-factory/assemble.py <pack>` picks and orders the final set by the judged difficulty of the question and the player's fame. Give each candidate a difficulty target in the pack file (`Jesse Lingard @4`): the writer aims for it, and a draft judged more than a point easier goes back for a harder angle. Candidate lists need real cult names for the last third, not just regular Premier League starters.

## Pipeline

| Step | Where |
|---|---|
| Evidence | `question-factory/wikipedia.py`, `question-factory/wikidata.py` (all traffic through `polite_http.py`, within each source's rate limits) |
| Team-mates and managers | `question-factory/squads.py`: match line-ups from the transfermarkt-datasets snapshot (CC0, 2012-13 to July 2026, top divisions, main cups, UEFA and major tournaments). `squads.py --download` fetches it once. Don't scrape transfermarkt.com: its terms forbid it |
| Second pass | Redraft with a new pack file (`packs/<pack>-b.txt`), then `question-factory/merge_pass.py <pack> <pack>-b <pack>-final` (the second pass wins, since it was judged under the newer rules, unless it has a factual problem and the first was READY), `assemble.py <pack>-final --min-style 3 --size <n>` (the judge is strict, so a stricter pass leaves few READY; this also admits problem-free 3/5s, and pack size is not fixed: keep every question good enough, as the 2019 packs ran 61 to 90), then read every question yourself against the rules (the judge still lets player-name anchors and named nations through), and `tools/question-auditor/from_factory.py <pack>-final "Title" <category> --review <pack>` (decisions on unchanged questions carry over) |
| Keep the trail | `apply.py` writes `config/provenance/<review>.json` (decision, notes, fact-check quotes, sources with the Wikipedia revision) for every question it applies. Never delete it; it's how a question is audited later |
| Hand-written top-up | For players whose drafts all fell short, write questions by hand from lines that already passed the fact-check (the factory output keeps every alternative), checking each name in `squads.teammates`/`managers`. Then `question-factory/check_written.py <questions.json> <pack>-final <pack>-hand` runs them through the same lint, fact-check and judge, and they join the review in difficulty order. The lint's one-club warning can be a false alarm where the squad data lacks a national team; say so on the card |
| Whole pack | `question-factory/.venv/bin/python question-factory/pack.py packs/<pack>.txt`: three drafts per player, lint, fact-check, uniqueness, style score, up to two revision rounds, best draft kept. Writes `question-factory/out/<pack>.json` |
| Single drafts | `question-factory/generate.py "Player Name"` (older one-off path) |
| Fact-check | `question-factory/factcheck.py`: claims split out, checked by two model families (Qwen and Gemma). A claim passes when a model quotes a line that states it and neither quotes a contradiction; squad-data lines settle team-mate and manager claims |
| Evals | `python3 question-factory/evals/run.py` writes `question-factory/evals/report.md` and `history.csv`. Re-run after any prompt or rule change and compare against history |
| Review | `tools/question-auditor/`: Lewis approves, edits or rejects every new or changed question in a click-through page (`auditor.py`, http://localhost:8790). Audits become reviews with `extract_audit.py` |
| Into the app | `tools/question-auditor/apply.py <review>` writes the approved ones into `config/baseQuestions.json` (new ids above the highest, never reused), then `npm run questions` in `mobile/` |

## Rules

- **Try not to state a clue's answer in the question** (position, retired, English): a general rule, not a hard one. Clues are earned, and an "I'm a defender, but…" kills the twist, unless the position is the twist itself (a keeper who scored). See STYLE.md, "Never give away a clue".

- **Answers include the plain spelling** (Lewis, 22 Nov 2026): every accented answer also appears without accents, in his order: full name, surname, then the plain forms ("Bruno Guimarães, Guimarães, Bruno Guimaraes, Guimaraes"). `pack.answers_for` does this, keeps particles (Van Dijk, De Bruyne, Mac Allister), drops "Júnior" (Vinícius) and allows short surnames (Eze). Names written surname first (Son Heung-min, Hwang Hee-chan) need the surname set by hand. Read every answer list before a review: a lone "Junior" or "Dijk" is a bug.
- **Clue flags follow How to Play.** Wingers count as Midfielders and wing-backs as Defenders, and a player can hold more than one position: a second one counts from 33% of their starts (`squads.position_clues`, from Transfermarkt line-ups since 2012-13). Lewis agreed on 20 Nov 2026 to apply this strictly, so Neymar and Ronaldo are Midfielders too. He set the line at 30%, lowered it to 25% on 21 Nov 2026, then raised it to 33% on 22 Nov 2026 because Mbappé (a forward) came out as a Midfielder too, which is just wrong. The 33% line applies from the 2020s pack on; the older packs keep the flags Lewis approved during the Nov 2026 audit, and he doesn't want them reviewed again. Line-up data only adds positions; it never removes one set from an older career. English means born in England, not citizenship, with one exception Lewis made on 20 Nov 2026: Raheem Sterling (born in Kingston, played for England) is English = yes, because no would only confuse people. Retired means retired as of the pack's date.

- Question ids are permanent (progress, the 2019 import and save codes store them).
- Wording must stay true over time: tie records to a date, never "currently" or "still".
- Lewis approves every question's wording before it goes in.
