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
| `factory/` | Drafts and fact-checks new questions. The house style is `factory/STYLE.md` |
| `tools/question-auditor/` | Review page for approving questions: `python3 tools/question-auditor/auditor.py` |
| `site/` | footballwhoami.com |
| `workers/alerts/` | New-pack push notifications |
| `design/` | Figma notes and art |

## What makes a good question

People loved this game because it was tricky. A question should make you stop and think, and the best ones leave you with a fact you want to tell your mates. Every question, new or old, is held to that.

**Tricky from the first question.** Famous players come early in a pack, but their questions still need a twist. Don't open with the thing everyone knows about the player. Start with a chapter people have forgotten, or a fact that sounds like it belongs to someone else, and let the lines add up. Two of the originals:

> My greatest sporting achievement is winning the Premier League, a season in which I made 10 appearances but did not find the net. I've played with Huth, Cole and Sheringham. *(Jérémie Aliadière)*

> I've scored the fastest brace in a WC. Yet I've only scored a total of 3 WC goals. My brace was scored in the tournament we went on to win. *(Toni Kroos)*

**Every name has to add something.** Teammates and managers are clues, so each one should narrow things down. Huth, Cole and Sheringham work because they come from different clubs and stages of Aliadière's career, and working out where he met each of them is the puzzle. "Managed by Guardiola, played alongside Haaland & De Bruyne" is three names but only one clue: Manchester City. Mix clubs, loans and national teams, and include a surprising name where you can.

**Protect the "aha".** The player's position, whether they're retired and whether they're English are clues you spend to find out, so the question shouldn't give them away. A defender who won the Champions League in consecutive seasons with two different clubs is only a surprise if the question doesn't say "I'm a defender". The exception is when the position is the twist, like a goalkeeper who scored.

**A pack climbs.** It opens with players most fans know and ends with cult heroes and facts only real fans will get. It isn't strictly sorted, so a famous name can turn up late with a hard question.

**Fair and true.** Every fact is checked against a source, and the wording has to stay true over time: "In 2023 I became…", never "currently" or "this season". Caps are made, not won.

**How the clue flags are decided** (they match the How to Play screen):

| Clue | Rule |
|---|---|
| Goalkeeper, Defender, Midfielder, Forward | The player's main position, plus any other position they started at least 25% of their games in. Wingers count as Midfielders and wing-backs as Defenders |
| Retired | Retired from playing as of the pack's release |
| English | Born in England, whoever they play for. So Che Adams (Scotland) is English and Kieran Tierney (born on the Isle of Man) isn't. One exception: Raheem Sterling, born in Jamaica, is English |

**Nothing goes into the app without approval.** New questions are drafted and fact-checked by the factory, then Lewis reads every one in the question auditor and approves, edits or rejects it. Question ids never change, because players' progress is stored against them.

The full house style, with more examples, is `factory/STYLE.md`. How to run the factory is in `.claude/skills/question-builder/SKILL.md`, and `AGENTS.md` has the rules for AI agents working in this repo.

## The 2019 app (repo root, kept for reference)

**Football - Who am I? / Football Puzzlers**


A Football(soccer) trivia guess who style app in which you will be given certain facts about a player and you must guess who is being described.
The questions are predominantly based around the Premier League with the majority within the last decade era.

**Built using React-Native backed by a Realm DB and utilising Fastlane for continuous deployment.**

**Play Store:** https://play.google.com/store/apps/details?id=com.footballtrivia

**App Store:**
https://itunes.apple.com/gb/app/football-who-am-i/id1338147291

**Run Android**
First start an emulator or connect a device!

`react-native run-android`

**Run iOS**
First Open XCode

`react-native run-ios`

**Android logs**

`react-native log-android`

**Clean Rebuild**

`rm -rf node_modules && npm install && react-native link`

**Generate Android Artefact**

In android dir:
`./gradlew assembleRelease`

**Release iOS Beta**

In ios/fastlane dir:
`fastlane ios beta`

**Dev Tools**
`react-devtools`

**react-native-text-gradient text strings must be rendered within a <Text> component**
Usage with rn >= 0.56.0
Wait until https://github.com/facebook/react/pull/13211 will be merged or patch react-native to remove failing invariant checks

`$ node node_modules/react-native-text-gradient/patch-rn.j`s