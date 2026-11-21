---
name: question-builder
description: Write, check and add "Football - Who am I?" questions with the local factory (factory/). Covers the house style, how teammates and managers are chosen as clues, the fact-check and its evals, and Lewis's approval before anything reaches the app. Use when generating a new pack, editing questions or changing the fact-checker.
---

# Question builder

The factory drafts questions from sourced evidence, checks every fact with local models and data, and hands Lewis a review. Nothing goes into `config/baseQuestions.json` until Lewis has approved the wording.

## The style

`factory/STYLE.md` is the house style, and the writer model is given it word for word. Read it before changing prompts. In short, the player tells a bit of their story in the first person: a hook, a twist, then a clue that narrows it down.

## Teammates and managers are chosen, not listed

Most questions name people the player played with or under. They are clues, so:

- pick **well-known names**, or **surprising ones** you wouldn't link with the player (a loan, a spell abroad, the end of a career), so working out where they met is the puzzle;
- take them from **different clubs and stages** of the career;
- avoid the **one obvious partner** unless the rest is hard;
- make **every name add something**: names (managers included) that all meet the player at one club only say "that club" (Lewis on Foden: Guardiola, Haaland & De Bruyne is just Man City). `pack.lint` fails it;
- **check every pairing against squad data** (same club or national squad at the same time; played under the manager). A model's say-so isn't enough, because Wikipedia prose rarely lists teammates, and the November 2026 eval showed both checkers answering "not found" on nearly all of them.

## Tricky from question one

The main reason people loved the game is that it was tricky and made you think. Lewis's verdict on the first 2020s pass (21 Nov 2026): the first 15 were all straightforward, which loses the fun. So famous players still get a twist: don't lead with the fact everyone knows, misdirect, and make the lines add up. See `factory/STYLE.md`, "Tricky and thought-provoking"; the style judge caps a question at 3 if its first sentence gives the answer away.

## Packs get harder as you go

Lewis's packs open with players everyone knows and climb towards cult names and obscure facts, loosely rather than strictly (a famous name with a hard question can come late). Candidate lists need plenty of harder players, and `factory/assemble.py <pack>` picks and orders the final set by the judged difficulty of the question and the player's fame. Give each candidate a difficulty target in the pack file (`Jesse Lingard @4`): the writer aims for it, and a draft judged more than a point easier goes back for a harder angle. Candidate lists need real cult names for the last third, not just regular Premier League starters.

## Pipeline

| Step | Where |
|---|---|
| Evidence | `factory/wikipedia.py`, `factory/wikidata.py` (all traffic through `polite_http.py`, within each source's rate limits) |
| Team-mates and managers | `factory/squads.py`: match line-ups from the transfermarkt-datasets snapshot (CC0, 2012-13 to July 2026, top divisions, main cups, UEFA and major tournaments). `squads.py --download` fetches it once. Don't scrape transfermarkt.com: its terms forbid it |
| Second pass | Redraft with a new pack file (`packs/<pack>-b.txt`), then `factory/merge_pass.py <pack> <pack>-b <pack>-final` (new READY questions replace old ones), `assemble.py <pack>-final`, and `tools/question-auditor/from_factory.py <pack>-final "Title" <category> --review <pack>` (decisions on unchanged questions carry over) |
| Whole pack | `factory/.venv/bin/python factory/pack.py packs/<pack>.txt`: three drafts per player, lint, fact-check, uniqueness, style score, up to two revision rounds, best draft kept. Writes `factory/out/<pack>.json` |
| Single drafts | `factory/generate.py "Player Name"` (older one-off path) |
| Fact-check | `factory/factcheck.py`: claims split out, checked by two model families (Qwen and Gemma). A claim passes when a model quotes a line that states it and neither quotes a contradiction; squad-data lines settle team-mate and manager claims |
| Evals | `python3 factory/evals/run.py` writes `factory/evals/report.md` and `history.csv`. Re-run after any prompt or rule change and compare against history |
| Review | `tools/question-auditor/`: Lewis approves, edits or rejects every new or changed question in a click-through page (`auditor.py`, http://localhost:8790). Audits become reviews with `extract_audit.py` |
| Into the app | `tools/question-auditor/apply.py <review>` writes the approved ones into `config/baseQuestions.json` (new ids above the highest, never reused), then `npm run questions` in `mobile/` |

## Rules

- **Try not to state a clue's answer in the question** (position, retired, English): a general rule, not a hard one. Clues are earned, and an "I'm a defender, but…" kills the twist, unless the position is the twist itself (a keeper who scored). See STYLE.md, "Never give away a clue".

- **Clue flags follow How to Play.** Wingers count as Midfielders and wing-backs as Defenders, and a player can hold more than one position: a second one counts from 25% of their starts (`squads.position_clues`, from Transfermarkt line-ups since 2012-13). Lewis agreed on 20 Nov 2026 to apply this strictly, so Neymar and Ronaldo are Midfielders too. He set the line at 30%, then lowered it to 25% on 21 Nov 2026 so Vinícius Júnior (27% up front) is a Forward as well; 23-24% shares (Obertan, Evra, Aubameyang) still don't count. Line-up data only adds positions; it never removes one set from an older career. English means born in England, not citizenship, with one exception Lewis made on 20 Nov 2026: Raheem Sterling (born in Kingston, played for England) is English = yes, because no would only confuse people. Retired means retired as of the pack's date.

- Question ids are permanent (progress, the 2019 import and save codes store them).
- Wording must stay true over time: tie records to a date, never "currently" or "still".
- Lewis approves every question's wording before it goes in.
