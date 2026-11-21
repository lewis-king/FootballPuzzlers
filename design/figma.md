# Figma: Football Who Am I – Revival

File: https://www.figma.com/design/pm3LBsGJW2PIdR4Exapawq (key `pm3LBsGJW2PIdR4Exapawq`). Design v1, 18 Nov 2026, waiting for Lewis's approval.

## Pages

| Page | Id | What's on it |
|---|---|---|
| 00 Cover | 0:1 | Cover frame `7:292` with status pill |
| 01 Foundations | 1:2 | Swatches, type ramp, spacing and radius (`7:2`) |
| 02 Illustrations | 1:3 | Empty. Keep the existing pastel ball icon for now |
| 03 User journey | 1:4 | 11 screens in three rows |
| 04 Components | 1:5 | Components below |
| 05 Motion & interaction | 1:6 | Motion table `7:145` |

## Screens (393×852)

| Row | Screens |
|---|---|
| Core loop | Home `5:4`, Pack `5:83`, Question `5:177`, Clue sheet `6:85`, Correct `6:149` |
| Help and money | Reveal a letter `6:195`, Unlock a pack `6:239`, Pack complete `6:291` |
| Your save | Settings `6:322`, Enter a code `6:373`, Welcome back `6:411` |
| Notifications | Notify me `20:319` (opt-in sheet, approved 20 Nov 2026) |
| Pack complete v2 | `26:326` (approved 20 Nov 2026): pack photo, trophy, confetti, three stats; Share my result + Back to home. Replaces `6:291`, whose "Up next" card Lewis rejected |

Home options (Lewis asked for the pack photos back, 18 Nov 2026): A Photo cards `11:361`, B Featured + grid `11:427`, C List + spotlight `11:500`. **Lewis chose B.** It now sits first in the core-loop row; the v1 list home `5:4` moved to the options row, marked superseded.

Other decisions from that review: keep the banner ad on the question screen; packs are £1.99, priced in the stores.

Second review (18 Nov 2026): keep the 2019 photos for Starter, World Cup and Champions League; generate photos only for new packs (2020s first), in the same real-photo style. The play icons are gone (cards are obviously tappable). Clues and Reveal a letter are now matching two-line buttons that show what's left ("1 left", "3 left"). The "5 in a row" stat on Correct is now "days in a row": a daily streak, approved by Lewis 18 Nov 2026. Design approved; build started.

Pack photos on 02 Illustrations, image hashes for reuse: starter `6ecb980f39b341d990ff5bfb8d5d29a69c5cf68d`, World Cup `45ab6c540f969305e63c1bf6dd6837267d1a76be`, Champions League `0e07becc4adfa03f073b52b287cc903d8ea399c9`. These are the 2019 photos (a Nike ball, stadiums with sponsor boards). The 2020s pack has a typographic gradient for now.

## Polish pass (20 Nov 2026, approved by Lewis the same day, including the teaser question per pack)

Lewis asked for every screen to feel as rewarding as Pack complete v2.

- **Unlock a pack `6:239`** (edited in place): now over Home B instead of the superseded list, World Cup photo art, and a "taste" card with a real question from the pack (id 140). The pack needs a `teaser` question id in its metadata.
- **Question · so close `28:401`**: "Question 7 of 90" with a thin pack-progress bar; wrong answers shake the field; one or two letters out shows "So close. Check the spelling."
- **Pack v2 `28:459`**: pack photo behind the header; solved tiles show the player's surname (local component `Solved tile` `28:456`, props Number and Surname), so the grid reads as a collection.
- **Home B `11:427`** (edited): the "More packs, coming soon" tile is now "Next pack · Tap to get notified" with a bell. It opens the Notify me sheet.
- **Settings `6:322`** (edited): "New pack alerts" toggle row.

## Clue icons and question screen v3 (approved 20 Nov 2026: option A, built)

- **Clue icon** component set `36:534` (Clue = GK, DEF, MID, FWD, RET, ENG). Positions are a pitch attacking to the right with the player's zone filled; Retired is an hourglass; English is the St George's cross. SVG sources in `design/art/icons/`.
- **Clue tile** component set `36:556` (State = Yes, No, Open): the icon with a ✓/✗ badge, or a dashed open slot.
- **Question v3 · A centred** `36:637` and **A, short question** `36:799`: the card fills the space down to the answer box, the question is centred in it (short questions set larger), and used clues sit at the bottom of the card as tiles.
- Option B (left-aligned) was rejected and removed. No "clues left" counter: the two slots show it.
- **Clue card** `39:537` (State = Hidden, Yes, No, Spent) and **Clue sheet v2** `39:538`: the six clues as icon cards in a 3×2 grid.


| Component | Id | Properties |
|---|---|---|
| Button (set) | 2:8 | `Variant` = Primary / Secondary / Ghost, `Label#2:0` |
| Clue chip (set) | 2:25 | `State` = Hidden / Yes / No / Spent, `Clue#2:4` |
| Question tile (set) | 2:32 | `State` = Open / Next / Answered, `Number#2:9` |
| Answer field (set) | 2:39 | `State` = Empty / Focused / Wrong, `Value#2:13` |
| List row | 2:40 | `Label#2:17` |
| Pack card (set) | 3:23 | `State` = Open / Locked, `Title#3:0`, `Meta#3:3`, `Short#3:6`, `Badge#3:9` |
| Nav bar | 3:24 | `Title#3:12`, `Right#3:13` |

## Tokens

- Colour collection, mode Night: `bg/*`, `surface/*`, `text/*`, `brand/*`, `feedback/*`, `pack/*`, plus `*-tint` variables (accent at 16% alpha) for tinted fills. Paint opacity on a variable-bound fill does not survive, so tints are their own tokens.
- Layout collection: `space/4…40`, `radius/sm 10`, `radius/md 16`, `radius/lg 24`, `radius/pill 999`.
- Text styles (Montserrat): Display 34, Title 24, Headline 18, Question 20/30, Body 15, Body Strong, Label 12 caps, Caption 12, Number 28, Answer 22.
- Effects: `shadow/card`, `glow/brand`, `blur/aurora` (120px layer blur).

## Decisions shown in the design

- Clue labels: Goalkeeper, Defender, Midfielder, Forward, Retired, English ("English = born in England", from the original "I am English").
- Two clues per question, the third tap shakes (kept from 2019). Up to three revealed letters via a rewarded ad, explained before it plays.
- Save code: copy and paste only, no links, no account (decided 18 Nov 2026).
- Banner ad slot kept on the question screen, as in 2019. Open question for Lewis.
