# House style for "Football - Who am I?" questions

Taken from Lewis's original 212 questions, written by hand in 2017-19. New questions should read as if he wrote them.

## The voice

The player is telling you a bit of their story. They are not reading out their Wikipedia infobox.

- **First person, conversational British English.** "I've", "I was", "my club", "we".
- **The sentences connect.** About half of the originals link one sentence to the next: "The following year…", "Yet…", "Although…", "It was these performances which…", "Following my time at Arsenal…".
- **There's a twist or tension.** The best ones set up something surprising and then pay it off:
  - *"During a WC winning campaign I played in every match and did not register a single shot on goal. With that being said, I'm actually in the top 5 of all-time leading goalscorers for my country."*
  - *"I've scored the fastest brace in a WC. Yet I've only scored a total of 3 WC goals."*
  - *"My greatest sporting achievement is winning the Premier League, a season in which I made 10 appearances but did not find the net."*
- **A little feeling.** "Unfortunately I'm well known for…", "Incredibly…", "I was lucky to…", "quite possibly my greatest team achievement", "I've had the honour of…".
- **The final clue narrows it down.** Often it's teammates, managers or clubs ("I've played with the likes of Torres, Kalou, Alonso & Keane"). It narrows the answer without giving it away.

## Teammates and managers are clues, so choose them

Naming who the player played with or was managed by is a big part of the game, and it shouldn't be done at random. Each name has to do some work:

- **Names people know.** A famous teammate is a clue a casual fan can use. Nobody gets anything from an unknown squad player.
- **Or names that surprise.** Good questions mix in a teammate or manager you'd never connect with the player: a short spell abroad, an odd loan, a big name at the end of their career. "I've played with Podolski, Ashley Cole & Idrissa Gueye" works because those three don't obviously belong together. Working out where the player crossed paths with each of them is how you solve it.
- **Spread across clubs.** Take names from different clubs, and ideally different stages of the career, so the list narrows things down rather than pointing at one squad.
- **Each name must add something.** If every name meets the player at the same club, together they only say "that club". "Managed by Guardiola & played alongside Haaland & De Bruyne" is three names and one clue (Man City); two City names and someone from a loan or the national team would be a real puzzle. Managers count as names.
- **Never a giveaway.** Avoid the one partner everyone links with the player (a famous strike partnership, a sibling) unless the rest of the question is hard.
- **Every pairing is checked.** The two must have been at the same club, or in the same national squad, at the same time, and for managers the player must have played under them. This is checked against squad data, not left to a model.

## A pack gets harder as you go

The packs start with players almost everyone knows and get trickier, with cult names and more obscure facts later. That climb is a big part of what made the game hooking. It isn't strictly sorted: what's obvious to one fan isn't to another, and a famous name can turn up late with a hard question (Terry, Torres and Lukaku sit near the end of the Starter Pack). So a pack needs plenty of harder players, not only stars, and every question should be fair for where it sits. `assemble.py` does the ordering.

## Hooks: memorable moments, and the odd delightful oddity

Most questions stand on things fans actually talk about: a famous goal, a final, a record, a transfer saga, a row, a cult-hero story. When the moment is famous, tell it the way fans remember it: Mitoma's assist against Spain is "the cross that was ruled in by a millimetre", not "an assist for a goal awarded after a lengthy VAR review".

The other kind that works is the obscure fact that makes people smile or say "really?": Mitoma wrote his university thesis on dribbling; Aspas took more corners than shots in the Premier League. Those are great, used now and then.

What doesn't work is the dull obscure fact: true, but nobody remembers it and nobody is charmed by it (a procedural detail, a minor stat, an award no one has heard of). The test: would a fan say "oh, that one", or "no way, really?" If neither, pick something else.

## Tricky and thought-provoking, from question one

This is the main reason people loved the game. Every question should make you think, the famous players included, and question 1 included. Lewis on the first 2020s draft (21 Nov 2026): the first 15 were all straightforward, and that takes most of the fun out of it, even if it lets people with less knowledge get through.

- **Don't lead with the fact everyone knows.** If the first line is what any fan would say about the player in one breath (Bellingham's World Cup goal, Kane's goal records), the question is over before it starts. Open with a chapter people have forgotten, or a fact that sounds like it belongs to someone else.
- **Misdirect.** Set up an assumption and let the rest overturn it: the defender who won consecutive Champions Leagues, the World Cup winner who never had a shot.
- **Famous players get tricky angles, not obscure trivia.** Their fame makes the answer findable in the end; the question supplies the thinking. Tell a famous moment from the side fans forget.
- **The clues add up.** The answer should click when you put the lines together, not from any one line on its own. That's why each name in a list has to add something.
- **Gentler early, never obvious.** Early questions can be fair to a casual fan with a clue or a revealed letter, but nobody should get them from the first sentence.

## Never give away a clue, and protect the "aha"

The clues (Goalkeeper, Defender, Midfielder, Forward, Retired, English) are things the player earns by spending a clue. As a general rule (not a hard one), try not to hand them over for free:

- **Don't name the player's position** ("I'm a defender", "as a striker", "from midfield"). It spends their clue for them and often kills the twist.
- **Don't state the answer to the other clues either:** whether they're retired or English.

The best questions leave you with something surprising you want to tell your mates. Lewis's example from the 2026 audit:

> I won the Champions League in consecutive seasons with two different clubs. I've scored more than 10 goals in the competition.

Written with "I'm a defender, but…" it gives the game away. Without it, the guesser assumes a midfielder or striker, and finding out it's a defender is the wow. Before keeping a fact, ask what the guesser will assume, and let the answer overturn it.

The exception is when the position *is* the twist: a goalkeeper who scored the longest goal (Begović), a keeper with Premier League assists (Paul Robinson), a striker who took more corners than shots (Aspas). Then say it.

## Shape

- 2 to 3 sentences, around 20 to 40 words (the originals' median is 28; the longest is 64).
- Open with a hook: an unusual achievement, record, low point or contradiction.
- Develop it: a consequence, contrast or "the following season".
- Close with a narrowing clue.

## Rules that keep it fair and true

- Don't name the player, their nickname or anything that gives the name away.
- Every fact comes from the evidence, and the wording must stay true over time:
  - Tie records to a time ("At the 2022 World Cup I…"), or say "I once held the record for…" when it could be beaten.
  - Never write "currently", "still", "as of" or "this season".
- A keen fan should get it after some thought. A casual fan should need a clue or a revealed letter.
- Caps are "made", not "won" ("I've made over 50 caps for my country"): Lewis's wording, since winning a cap isn't a win.
- No exclamation marks and no em dashes. Ampersands in name lists are fine ("Kalou, Alonso & Keane"), as Lewis wrote them.

## What to avoid

Three disconnected facts in a row. This draft was correct but flat:

> I once held the outright Premier League record for the most penalties scored without a single miss. I've won the PFA Young Player of the Year award and scored the equaliser in a European Championship final. My career has seen me move from Manchester City to Chelsea.

The same facts told as a story:

> I came through the academy at Manchester City, but it was only after leaving for Chelsea that my career really took off. Within a year I'd been named PFA Young Player of the Year, and that summer I came off the bench to score the equaliser in a European Championship final.

## Examples the generator learns from

These are originals that passed the November 2026 audit unchanged: ids 9, 32, 37, 38, 51, 59, 82, 117, 124, 131, 132, 133, 148, 211. If one of them is later changed, swap it out so the model never learns from a wrong fact.
