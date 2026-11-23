**Football - Who am I?**

A football trivia game in the spirit of "guess who": you're given a few facts about a player in their own words, and you work out who it is. Clues and revealed letters help when you're stuck.

**Play Store:** https://play.google.com/store/apps/details?id=com.footballtrivia
**App Store:** https://itunes.apple.com/gb/app/football-who-am-i/id1338147291
**Website:** https://footballwhoami.com

## The 2026 relaunch

| Folder | What it is |
|---|---|
| `mobile/` | The app, rebuilt with Expo. Start with `mobile/README.md` |
| `config/baseQuestions.json` | All the questions |
| `question-factory/` | The question factory: drafts and fact-checks new packs with local AI models (see below). The house style is `question-factory/STYLE.md` |
| `tools/question-auditor/` | Review page for approving questions: `python3 tools/question-auditor/auditor.py` |
| `site/` | footballwhoami.com |
| `workers/alerts/` | New-pack push notifications |
| `design/` | Figma notes and art |

## What makes a good question

People loved this game because it was tricky. A question should make you stop and think, and the best ones leave you with a fact you want to tell your mates. Every question, new or old, is held to that.

**Tricky from the first question.** Famous players come early in a pack, but their questions still need a twist. Don't open with the thing everyone knows about the player. Start with a chapter people have forgotten, or a fact that sounds like it belongs to someone else, and let the lines add up. Two of the originals:

> My greatest sporting achievement is winning the Premier League, a season in which I made 10 appearances but did not find the net. I've played with Huth, Cole and Sheringham. *(Jérémie Aliadière)*

> I've scored the fastest brace in a WC. Yet I've only scored a total of 3 WC goals. My brace was scored in the tournament we went on to win. *(Toni Kroos)*

**One headline fact at most.** Winning the Ballon d'Or, a country's scoring record or a famous final each narrow it down to a handful of players. Put two together and the question is over. Keep the more intriguing one. Lewis's edit of a Kane draft:

> ~~I was released from the Arsenal academy as a child for being a bit chubby. Years later I became the highest scoring English player in history and won the Ballon d'Or.~~
> I was released from my academy as a child for being a bit chubby. Years later I won the Ballon d'Or.

**Don't over-specify.** A detail that leaves only two or three obvious names does the guessing for you. "My nation's highest-scoring midfielder in a single season" is a better clue than "the highest-scoring Portuguese midfielder", which leaves Ronaldo, Bruno Fernandes and not many others. Name a club or country only when most people wouldn't expect it. Olise's "following my time at Crystal Palace" became "following my time in the Premier League": a club a player is known for narrows it down far too much, while an obscure loan or youth club is the kind of surprise that makes the question.

**Every name has to add something.** Teammates and managers are clues, so each one should narrow things down. Huth, Cole and Sheringham work because they come from different clubs and stages of Aliadière's career, and working out where he met each of them is the puzzle. "Managed by Guardiola, played alongside Haaland & De Bruyne" is three names but only one clue: Manchester City. Mix clubs, loans and national teams, and include a surprising name where you can. Household names barely help: "managed by Pep Guardiola & Xabi Alonso" just says City and Real Madrid. One famous name at most, then team-mates from a loan or an early club, like Salah with Gilardino, Nainggolan and Fernando Torres. This game has always been about the obscure details.

**Protect the "aha".** The player's position, whether they're retired and whether they're English are clues you spend to find out, so the question shouldn't give them away. A defender who won the Champions League in consecutive seasons with two different clubs is only a surprise if the question doesn't say "I'm a defender". The exception is when the position is the twist, like a goalkeeper who scored.

**A pack climbs.** It opens with players most fans know and ends with cult heroes and facts only real fans will get. It isn't strictly sorted, so a famous name can turn up late with a hard question.

**Fair and true, and built to last.** Every fact is checked against a source. Questions aren't updated once a pack ships, so the wording has to stay true: "In 2023 I became…", never "currently" or "this season", and nothing tied to where a player is now. "The first player from my current league to win the Ballon d'Or since 2008" is wrong the day Rodri moves; "the first midfielder to win it since 2018" stays true. (Not "the first defensive midfielder since Matthäus in 1990": "defensive" narrows it down too far, and simply dropping the word would make it false, since Zidane, Figo and Kaká won it in between. When a vaguer wording isn't true, find a different anchor.)

**A year is for records, not trophies.** A year keeps a record true, but next to a famous team trophy it gives the answer away: "In 2026, I won the Premier League and then moved to Turkey" just sends you to Arsenal's 2026 squad. "I won the Premier League and then moved to Turkey" makes you remember who it was (Trossard).

**Anchor records to a year, not another player.** "Since 2018", not "since Modrić in 2018". Naming him gives away a fact from his own question, in this pack or a future one, and every famous name is a possible future answer. Teammates and managers in the closing clue are the exception, because they're there as clues. Caps are made, not won.

**How the clue flags are decided** (they match the How to Play screen):

| Clue | Rule |
|---|---|
| Goalkeeper, Defender, Midfielder, Forward | The player's main position, plus any other position they started at least a third (33%) of their games in. Wingers count as Midfielders and wing-backs as Defenders |
| Retired | Retired from playing as of the pack's release |
| English | Born in England, whoever they play for. So Che Adams (Scotland) is English and Kieran Tierney (born on the Isle of Man) isn't. One exception: Raheem Sterling, born in Jamaica, is English |

**Answers forgive accents.** Every answer is listed with and without its accents (Agüero and Aguero, Guimarães and Guimaraes), and the app ignores accents, capitals and punctuation when it checks a guess. Knowing the player is enough; you don't need the exact local spelling.

**Nothing goes into the app without approval.** New questions are drafted and fact-checked by the factory, then Lewis reads every one in the question auditor and approves, edits or rejects it. Question ids never change, because players' progress is stored against them.

The full house style, with more examples, is `question-factory/STYLE.md`. How to run the factory is in `.claude/skills/question-builder/SKILL.md`, and `AGENTS.md` has the rules for AI agents working in this repo.

## How the question factory works

New packs are written and checked by `question-factory/`, a pipeline that runs on one machine with an RTX 5090. It uses two open-weight models through Ollama: **Gemma 4 31B** (Google) and **Qwen 3.8 27B** (Alibaba). There are no API calls and nothing to pay per question. The app never calls a model: questions are made ahead of time and ship as data.

```
pack list (question-factory/packs/<pack>.txt, one player per line, with a difficulty target: "Jesse Lingard @4")
  │
  ├─ 1. Evidence   Wikipedia article as numbered lines (pinned to a revision id)
  │                + who played with whom and under which manager, from match line-ups
  ├─ 2. Draft      Gemma writes three different questions in the house style
  ├─ 3. Lint       code checks: no giveaway names, no dated wording, no club he's known for,
  │                names that all meet at one club, length
  ├─ 4. Check      every claim fact-checked by both Gemma and Qwen; also "does anyone else fit?",
  │                "will this date?", and Qwen judges the writing and difficulty
  ├─ 5. Revise     drafts with problems go back to Gemma with the exact faults, up to two rounds
  ├─ 6. Assemble   best question per player, ordered so the pack climbs from stars to cult heroes
  └─ 7. Review     Lewis approves, edits or rejects every card in the question auditor
```

**Why two models.** Gemma writes and Qwen judges the style, so the writer never marks its own work. Both models fact-check every claim, and the stricter verdict wins. Two model families make different mistakes, so an error has to get past both.

**How a claim is checked** (`question-factory/factcheck.py`). Each question is split into single claims, such as "he was released by Atlético in 2013". Each claim gets a type: fact, number, negative, sequence, superlative or teammate. The checker must list the evidence lines it's relying on before it gives a verdict. Negative claims ("never"), claims about order ("years later") and superlatives ("the first", "the youngest") each get their own procedure, because that's where checkers usually let errors through. Code then checks that every quoted line really is in the article, so an invented quote can't support a claim. A claim that isn't stated in the evidence fails, even if it's true.

**The data.**
- **Wikipedia**, fetched politely through `polite_http` and cached by revision, so the exact text checked is always known.
- **Teammates, managers, clue flags and retirement:** [transfermarkt-datasets](https://github.com/dcaribou/transfermarkt-datasets), a CC0 snapshot of match line-ups from 2012-13 onwards, queried with DuckDB. The factory never scrapes transfermarkt.com.

**How good the checker is.** `question-factory/evals/` tests it on 211 questions with known answers: true originals, plus false versions with a wrong year, a record since broken, or a teammate he never played with. It catches 96% of the false questions. But it also wrongly flags about 60% of the true ones, mostly because the article doesn't spell the fact out. It is deliberately strict, which is why a person still reads every question.

**What a pack takes.** The 2020s pack drafted 96 players in two passes. Each pass ran overnight, and most of the time went on fact-checking. After it:
- a merge keeps each player's best version;
- questions that still fell short were rewritten by hand from lines that had already passed, then checked again (`question-factory/check_written.py`);
- Lewis reviewed the lot.

His edits become rules: they go into `question-factory/STYLE.md`, the lint and the judge's prompt, so the next pack starts from a higher bar.

**The audit trail.** When a review is applied, `config/provenance/<review>.json` keeps everything behind each question, by its id:
- the decision and its date, and the wording before any edit;
- the fact-check claims with their quotes;
- the evidence behind the clue flags;
- the sources, with a link to the exact Wikipedia revision.

The app doesn't use it. It's there so any question can be audited later.

**Making the next pack:** write `question-factory/packs/<pack>.txt`, then run `question-factory/.venv/bin/python question-factory/pack.py packs/<pack>.txt`, `question-factory/assemble.py <pack>` and `tools/question-auditor/from_factory.py <pack> "<Title>" <category>`. Then review the pack, apply it with `apply.py`, and rebuild the app's questions with `npm run questions`. The question-builder skill has the details.

## The 2019 app

The original React Native app (v2.2, React Native 0.57 with Realm and Fastlane) lived at the repo root until November 2026. It's preserved at the git tag `app-2019`: `git checkout app-2019 -- <path>` brings back any file. The new app reads its old saves on first launch (`mobile/src/lib/legacyRealm`), so nothing on players' phones depends on it.
