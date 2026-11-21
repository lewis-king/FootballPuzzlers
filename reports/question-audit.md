# Question audit, November 2026

All 212 questions checked against the web on 18 Nov 2026. The full per-question findings, with proposed wording, flag changes and sources, are in `research_notes/question-audit/`:

| File | Pack | Questions |
|---|---|---|
| `eng1-a.md` | Starter Pack | 1–45 |
| `eng1-b.md` | Starter Pack | 46–90 |
| `wc.md` | World Cup | 91–151 |
| `cl.md` | Champions League | 152–211 (201 twice) |

`baseQuestions.json` has not been changed. Nothing goes in until Lewis approves the wording.

## Results

| Verdict | Count | Meaning |
|---|---|---|
| Keep | 79 | Still correct as written |
| Fix flags | 32 | Text fine, clue flags wrong (mostly "retired") |
| Reword | 100 | Same player, claim or wording needs changing |
| Replace | 1 | Q203 Alan; proposed Haaland question instead |

Many rewords also carry flag fixes. Altogether **63 players have retired since 2019** and need RET set to true.

## Records that have fallen

| Q | Original claim | Now |
|---|---|---|
| 13 | Ledley King, fastest PL goal | Shane Long, 7.69s (2019) |
| 22 | Henry, most PL assists in a season | Bruno Fernandes, 21 (May 2026) |
| 43 | Yaya Touré, perfect PL penalty record | Raúl Jiménez, 14 from 14 (2026) |
| 48 | Begović, longest goal | Tom King (2021) |
| 56 | Paul Robinson, most PL assists by a keeper | Ederson (2024-25) |
| 57 | Guðjohnsen, Iceland's top scorer | Gylfi Sigurðsson |
| 91 | Klose, top WC scorer | Mbappé, 22 after the 2026 WC (one source so far, confirm) |
| 100 | Shilton, most caps and career appearances | Kane caps; Fábio appearances |
| 104 | Matthäus, most WC matches | Messi |
| 125 | Gyan, most WC penalties missed | Messi |
| 134 | Denílson, most WC sub appearances | Rashford |
| 144 | Sneijder, most WC Man of the Match awards in one tournament | Messi, 5 (2022) |
| 154 | Casillas, most CL appearances | Ronaldo |
| 159 | Luiz Adriano, only Messi also scored 5 | Haaland too (2023) |
| 163 | Totti, oldest CL scorer | Pepe (2023) |
| 172 | Babayaro, youngest CL player | Moukoko, then Dowman |
| 181 | Gomis, fastest CL hat-trick | Salah (2022) |
| 198 | Rooney, most CL goals by an Englishman | Kane |

Also out of date: Q110 Kane "never won a league" (Bundesliga), Q130 Messi "never lifted the WC" (2022), Q183 Alaba "won the CL once" (4 times), Q210 Lewandowski "never won the CL" (2020).

## Wrong when written

These were errors in 2019, not changes since:

- Q66 Şahin (wasn't subbed off in every game)
- Q25 Berbatov (never a PL assist leader)
- Q26 Poyet (did win a league)
- Q30 Anelka (caps and fees)
- Q85 Carew (West Ham weren't in the PL then)
- Q96 Mbappé (second-youngest in a *final*)
- Q106 Laudrup's brother (won the 1995 Confederations Cup)
- Q119 Buffon (Casillas also won the Golden Foot)
- Q149 (20 cards, not 16)
- Q170 (semi-final, not quarter-final)
- Q202 Ronaldinho (Zidane and Rivaldo got there first)
- Q206 Robben (lost 2012, won 2013)

## Answers that weren't unique

More than one player fits: Q27, Q29, Q40, Q158, Q164, Q167, Q168, Q169, Q171, Q173, Q205. Each reword adds one clue that rules the others out.

## Decisions (Lewis, 18 Nov 2026)

1. **ENG = born in England**, as the How to Play screen says, whatever country the player represents. All 212 ENG flags were checked against Wikidata birthplaces by `factory/check_eng.py` (`research_notes/question-audit/eng-birthplace.md`). 209 agree, including Q50 George Boyd (born Chatham, already ENG true). The one real error is **Raheem Sterling (Q40, Q190): born in Kingston, Jamaica, so ENG becomes false.** Q203 Alan wasn't found but is being replaced.
2. **Ronaldinho is RET false** while he's playing for Ravenna. Questions are stamped "correct as of Dec 2026".
3. **Broken records become "I once held the record for…"**, so they don't date again.
4. **Q201 Beckham** never reached players because Lucas Pérez overwrote it. It gets a new id and ships as a new CL question.
5. **Still open: Q153, Ronaldo "most CL assists".** Opta says Giggs, UEFA says Ronaldo. Recommend switching to a different Ronaldo fact.

## Still to verify before launch

- Mbappé's 22 World Cup goals (one source).
- Retirement status for Rodwell, Begović, Schlupp, Jordi Gómez, Obertan, Bassong, Gervinho, Quaresma, Ramos, Lovren, Mata and Lucas Pérez.
- Unconfirmed facts: Q18, Q54, Q60, Q63.

Re-run the record checks on the day the questions ship. The question factory (Phase 2) will make that routine.
