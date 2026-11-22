"""Generate a whole pack: several drafts per player, every fact checked, the best true one kept.

Usage: question-factory/.venv/bin/python question-factory/pack.py packs/2020s.txt [--limit N] [--only "Name"]

Per player:
1. Evidence: the Wikipedia article as numbered lines, plus squad data for the team-mates and managers
   worth naming (squads.clue_people: the best known and the most surprising, per STYLE.md).
2. Draft: the writer (Gemma) writes three different questions from that evidence in the house style.
3. Lint in code: no giveaway names, no dated words, no em dashes or exclamation marks, sensible length.
4. Check: every claim against the evidence by two model families (factcheck.run_batch), plus
   uniqueness and dated wording; a third pass scores the voice against Lewis's originals (Qwen, so the
   writer never marks its own work).
5. Revise: if no draft is clean, the writer gets the exact problems and tries again (up to 2 rounds).
6. Keep the cleanest, best-written draft. Players with no clean draft are listed for Lewis with their
   best attempt and what is wrong with it.

Everything is cached (drafts, checks, scores), so a stopped run picks up where it left off. Models are
used in batches across all players so the GPU swaps models a handful of times, not per question.
Writes question-factory/out/<pack>/<player>.json and question-factory/out/<pack>.json. Nothing touches the app.
"""
import argparse
import json
import pathlib
import re
import sys
import time

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))
import factcheck  # noqa: E402
import llm  # noqa: E402
import squads  # noqa: E402
import wikipedia  # noqa: E402
from cachefile import read_json, write_json  # noqa: E402
from generate import STYLE_GUIDE, examples  # noqa: E402

CACHE = HERE / 'cache' / 'pack'
DRAFTS = 3
ROUNDS = 2

WRITER_SYSTEM = (
    "It is now November 2026; the evidence is current to then. "
    "You write questions for 'Football - Who am I?', a guess-the-player quiz, in the voice of its creator, "
    "Lewis. Follow his style guide closely; the storytelling voice matters as much as the facts.\n\n"
    + STYLE_GUIDE +
    "\n\nHard rules:\n"
    "- Use ONLY facts stated in the numbered evidence, and list every fact you used as a claim with the "
    "line numbers that state it. The question text never contains brackets or line numbers.\n"
    "- Team-mates and managers come ONLY from the [Squad data] lines. Pick them as the style guide says: "
    "well-known names, or surprising ones from a club the player isn't known for, from different clubs. "
    "Refer to them by surname as Lewis does (\"Podolski, Ashley Cole & Gueye\"), using the full name only "
    "where the surname alone is ambiguous. A manager is never someone you \"played with\".\n"
    "- Never write anything that can change while the player is still playing in the present tense: no "
    "'currently', 'still', 'as of', 'this season', no 'I've never won X', no 'I'm the record holder'. Tie "
    "records and counts to a moment: 'In 2023 I became...', 'By the end of that season I had...'.\n"
    "- Prefer facts from the 2020s, the theme of this pack.\n"
    "- Put each clue sentence on its own line, as Lewis does.\n"
    "- The three drafts must use different hooks, not three wordings of one idea.")

DRAFT_SCHEMA = {
    'type': 'object',
    'properties': {'drafts': {'type': 'array', 'minItems': 1, 'maxItems': DRAFTS, 'items': {
        'type': 'object',
        'properties': {
            'hook': {'type': 'string', 'maxLength': 120},
            'question': {'type': 'string', 'maxLength': 600},
            'claims': {'type': 'array', 'maxItems': 10, 'items': {'type': 'object', 'properties': {
                'text': {'type': 'string', 'maxLength': 300},
                'evidence': {'type': 'array', 'maxItems': 6, 'items': {'type': 'integer'}}},
                'required': ['text', 'evidence']}}},
        'required': ['hook', 'question', 'claims']}}},
    'required': ['drafts'],
}

REVISE_SCHEMA = {**DRAFT_SCHEMA, 'properties': {'drafts': {
    **DRAFT_SCHEMA['properties']['drafts'], 'maxItems': 2}}}

STYLE_SYSTEM = (
    "It is now November 2026. "
    "You judge quiz questions for 'Football - Who am I?' against the creator's own handwritten originals "
    "and style guide. Score 1-5:\n"
    "5 = reads like one of the originals: the player telling a bit of their story, connected sentences, a "
    "twist or tension, a narrowing clue at the end, names chosen to intrigue, and built on moments fans "
    "actually remember, told the way they remember them.\n"
    "Obscure facts are welcome when they delight or surprise (a player who wrote his university thesis on "
    "dribbling). Score no higher than 3 if the hook is a DULL detail: neither memorable nor charming (a "
    "procedural note like 'after a lengthy VAR review', a minor stat, an award nobody knows).\n"
    "Lewis values questions that are tricky and thought-provoking, even for superstars and even early in a pack. "
    "Score no higher than 3 if the first sentence alone gives the answer to a casual fan (it leads with the "
    "most famous fact about the player), if it stacks two headline facts that each nearly give the answer (a "
    "Ballon d'Or and a national scoring record), if a detail such as a nationality or club narrows the field to "
    "two or three obvious names, if it anchors a record to another famous player ('since Modric in 2018', "
    "'breaking Messi's record') instead of a year, or if the names listed all point at one club, or if it puts a year next to a famous team trophy ('In 2026 I won the Premier League' just sends you to that squad; years are for keeping records true), or if they are all household names (Guardiola & Xabi Alonso say only 'City and Real Madrid'; the game is about obscurities).\n"
    "4 = good, one weakness. 3 = correct but flat or a list of facts. 2 = awkward, wordy or obviously "
    "machine-written. 1 = not usable.\n"
    "Also rate difficulty for a fan in the UK: 1 = almost everyone gets it, 3 = keen fans, 5 = experts only. "
    "Be strict; most drafts are not 5s.\n\nStyle guide:\n" + STYLE_GUIDE)

STYLE_SCHEMA = {
    'type': 'object',
    'properties': {
        'score': {'type': 'integer', 'minimum': 1, 'maximum': 5},
        'difficulty': {'type': 'integer', 'minimum': 1, 'maximum': 5},
        'why': {'type': 'string', 'maxLength': 300},
        'fix': {'type': 'string', 'maxLength': 300},
    },
    'required': ['score', 'difficulty', 'why', 'fix'],
}

# Present-tense standing that the next match could make false. Checked in code because it is
# mechanical; the models then judge the subtler cases.
LIVE = [r"\b(i'm|i am) (the|one of)\b", r'\bi hold\b', r'\bi\'ve never\b', r'\bi have never\b']
# Naming the player's own position, or saying they're retired or English, hands over a clue the
# guesser should earn and usually kills the twist (Lewis, Nov 2026 audit). "the keeper I beat" is fine;
# these patterns only catch the player describing themselves.
CLUE_GIVEAWAY = [r"\bi(?:'m| am| was|'ve been| have been) (?:a|an|the)? ?(?:\w+ )?(?:goalkeeper|keeper|defender|centre-back|center-back|full-back|"
                 r"left-back|right-back|wing-back|midfielder|winger|striker|forward|centre-forward)\b",
                 r"\bas a (?:goalkeeper|keeper|defender|centre-back|full-back|wing-back|midfielder|winger|striker|forward)\b",
                 r"\bi(?:'m| am) (?:now )?retired\b", r"\bsince (?:i )?retir", r"\bi(?:'m| am| was) (?:born )?(?:english|born in england)\b"]
BANNED = [r'\bcurrently\b', r'\bstill\b', r'\bas of\b', r'\bthis season\b', r'\bnowadays\b', r'\btoday\b',
          '—', '!', r'\[\d']


def _key(*parts):
    return factcheck._hash(*parts)


def _cached(name, key, fn):
    CACHE.mkdir(parents=True, exist_ok=True)
    f = CACHE / f'{name}-{key}.json'
    hit = read_json(f)
    if hit is not None:
        return hit
    out = fn()
    write_json(f, out)
    return out


# ---------------------------------------------------------------- evidence

def evidence(player):
    doc = wikipedia.article(player)
    lines = wikipedia.sentences(doc['text'])[:450]
    people = squads.clue_people(player)
    squad = []
    if people:
        cl = '; '.join(f'{c} {squads._when(a, b)} ({g} matches)' for c, a, b, g in people['clubs'])
        squad.append(f'[Squad data] Match line-ups (top divisions, main cups, UEFA competitions and major tournaments only; lower leagues and friendlies are missing, so this is not a full career) from 2012-13 onwards. Appeared for: {cl}')
        seen = set()
        for group, label in [('famous', 'well known'), ('surprising', 'surprising pick')]:
            for t in people[group]:
                if (t['name'], t['club']) in seen:
                    continue
                seen.add((t['name'], t['club']))
                squad.append(squads.line_teammate(t) + f" [{label}; best known for {t['bestKnownAt']}]")
        squad += [squads.line_manager(m) for m in people['managers']]
    return doc, lines, squad


def profile_clues(player):
    """App clue flags from data. RET is settled later from the article (see retired())."""
    pid = squads.find(player)
    p = dict(squads.profile(pid)) if pid else {}
    # How to Play: wingers are midfielders, more than one position is allowed, and English means
    # born in England (not citizenship).
    flags = squads.position_clues(pid) if pid else {k: False for k in ('GK', 'DEF', 'MID', 'FWD')}
    return {**flags, 'ENG': p.get('birthCountry') == 'England'}, p


RET_SCHEMA = {'type': 'object', 'properties': {
    'retired': {'type': 'boolean'}, 'quote': {'type': 'string', 'maxLength': 400}}, 'required': ['retired', 'quote']}


def retired(player, lines, prof):
    """Retired from playing? Settled by a quoted article line; a contract running past July 2026 means no."""
    exp = prof.get('contract')
    if exp and exp.year >= 2026 and exp.month >= 7 or exp and exp.year > 2026:
        return {'retired': False, 'quote': '', 'how': f'contract runs to {exp:%B %Y} (Transfermarkt)'}
    hits = [l for l in lines if re.search(r'retire', l, re.I)]
    if not hits:
        return {'retired': False, 'quote': '', 'how': 'no mention of retiring in the article'}
    r = _cached('ret', _key(player, hits), lambda: llm.chat_json(
        llm.CHECKER, 'Decide from the lines whether this footballer has retired from playing (not just from '
        'international football). Quote the deciding line exactly; empty if none.',
        f'Player: {player}\n\n' + '\n'.join(hits), RET_SCHEMA, temperature=0.0, max_tokens=500))
    ok = r['retired'] and factcheck.quote_found(r['quote'], lines)
    return {'retired': bool(ok), 'quote': r['quote'] if ok else '', 'how': 'article', 'contract': str(exp or '')}


# ---------------------------------------------------------------- drafting

def numbered(lines):
    return '\n'.join(f'[{i}] {l}' for i, l in enumerate(lines))


def aim(target):
    """What a difficulty target (1-5, set per player in the pack file with '@N') asks of the writer."""
    if not target:
        return ''
    if target <= 2:
        return f'\n\nAim for difficulty {target} of 5: a moment most fans remember, told so it still makes them think.'
    if target == 3:
        return ('\n\nAim for difficulty 3 of 5 (keen fans): not the first fact everyone knows about this player. '
                'A less obvious moment, and names from more than one club.')
    return (f'\n\nAim for difficulty {target} of 5 (keen fans to experts). Lead with something only real fans know: '
            'an early club, a loan, a youth or international story, a quirky record or moment. Name at least one '
            'surprising team-mate or manager from a club fans don\'t link with the player. It must stay fair: true, '
            'pointing at one player only, and solvable from the clues.')


def draft(player, ev, target=None):
    user = (f'Examples of the house style (Lewis\'s originals):\n\n{examples()}\n\n---\n\n'
            f'Write {DRAFTS} different questions whose answer is {player}.{aim(target)}\n\nEvidence:\n{numbered(ev)}')
    return _cached('draft', _key(WRITER_SYSTEM, player, ev, target or ''), lambda: llm.chat_json(
        llm.WRITER, WRITER_SYSTEM, user, DRAFT_SCHEMA, temperature=0.8, num_ctx=32768, max_tokens=3000))['drafts']


def revise(player, ev, attempt, problems, rnd, target=None):
    user = (f'Examples of the house style (Lewis\'s originals):\n\n{examples()}\n\n---\n\n'
            f'Answer: {player}\n\nYour draft:\n{attempt}\n\nWhat is wrong with it:\n'
            + '\n'.join(f'- {p}' for p in problems) +
            '\n\nWrite 2 improved questions that fix every problem. Drop or replace any claim that was not '
            'supported rather than rewording it, and keep the story.' + aim(target) +
            f'\n\nEvidence:\n{numbered(ev)}')
    return _cached('revise', _key(WRITER_SYSTEM, player, ev, attempt, problems, rnd, target or ''), lambda: llm.chat_json(
        llm.WRITER, WRITER_SYSTEM, user, REVISE_SCHEMA, temperature=0.7, num_ctx=32768, max_tokens=2500))['drafts']


def clean(text):
    text = re.sub(r'\s*\[[\d,\s]+\]', '', text)
    return '\n'.join(l.strip() for l in text.strip().splitlines() if l.strip())


def clue_hints(text):
    """Soft warnings, shown to the writer and on review cards but never blocking: the question names a
    clue the guesser should earn. Fine when the position is the twist itself (a keeper who scored)."""
    out = []
    for pat in CLUE_GIVEAWAY:
        m = re.search(pat, text, re.I)
        if m:
            out.append(f'names a clue ("{m[0]}"); keep it only if it is the twist, otherwise let the guesser earn it')
    return out


COMMON_FIRST = {'manchester', 'real', 'sporting', 'athletic', 'atletico', 'borussia', 'olympique', 'inter', 'west',
                'aston', 'crystal', 'nottingham', 'sheffield', 'queens', 'bristol', 'stade', 'racing', 'club', 'fc', 'afc',
                'ac', 'as', 'ss', 'ssc', 'rc', 'sv', 'vfl', 'vfb', 'tsg', 'rb', '1', 'hertha', 'paris', 'newcastle',
                'tottenham', 'wolverhampton', 'brighton', 'leicester', 'leeds', 'everton', 'liverpool', 'chelsea'}


def big_clubs(player):
    """Clubs a player is known for: 40+ games there, or a quarter of his club games. National teams aside."""
    pid = squads.find(player)
    if not pid:
        return []
    rows = [r for r in squads.clubs(pid) if r[0] not in squads.IDS.get('nations', ()) and not _is_nation(r[0])]
    total = sum(r[3] for r in rows) or 1
    return [r[0] for r in rows if r[3] >= 40 or r[3] / total >= 0.25]


def _is_nation(name):
    return squads._q('select count(*) from players where country_of_citizenship = ?', name)[0][0] > 50


def club_aliases(club):
    n = squads.norm(club)
    n = re.sub(r'\b(fc|afc|cf|football club|calcio|sad)\b', ' ', n).strip()
    n = re.sub(r'\s+', ' ', n)
    out = {n}
    first = n.split()[0] if n.split() else ''
    if len(first) >= 5 and first not in COMMON_FIRST:
        out.add(first)
    if n == 'tottenham hotspur':
        out |= {'tottenham', 'spurs'}
    if n.startswith('manchester'):
        out.add(n.replace('manchester', 'man'))
    return [a for a in out if a]


ELITE_MANAGERS = {'guardiola', 'klopp', 'ancelotti', 'mourinho', 'zidane', 'arteta', 'xabi alonso', 'simeone',
                  'conte', 'tuchel', 'flick', 'luis enrique', 'slot', 'wenger', 'ferguson', 'pochettino', 'emery',
                  'allegri', 'nagelsmann', 'ten hag', 'amorim', 'solskjaer', 'lampard', 'southgate', 'deschamps'}


def _household(m):
    """A name every fan knows: a top manager, or a team-mate whose peak value reached €70m."""
    if 'peakValue' in m:
        return (m.get('peakValue') or 0) >= 70e6
    return any(e in squads.norm(m['name']) for e in ELITE_MANAGERS)


def lint(player, answers, text):
    problems = []
    low = squads.norm(text)
    for a in answers:
        for w in squads.norm(a).split():
            if len(w) >= 4 and re.search(rf'\b{re.escape(w)}\b', low):
                problems.append(f'gives away the answer ("{w}")')
    for pat in LIVE:
        if re.search(pat, text, re.I):
            problems.append('wording will date: a present-tense record or "never" that a future match could undo; '
                            'anchor it to a moment ("In 2023 I became...", "I once held...")')
    for club in big_clubs(player):  # Lewis, 22 Nov 2026: "Crystal Palace just narrows it down way too much"
        lines = text.split('\n')
        if any(re.search(rf'\b{re.escape(alias)}\b', squads.norm(' '.join(lines[:2]))) for alias in club_aliases(club)):
            problems.append(f'names {club}, one of the clubs he is known for, so it narrows the answer to a handful '
                            'of players; say "my club", a region or a league instead (keep a club only when it is a '
                            'surprise, such as an obscure loan or a club he played against)')
    if re.search(r'\bcurrent\b', text, re.I):  # Lewis, 21 Nov 2026
        problems.append('tied to where the player is now ("current"): it goes wrong the day he moves club or league; '
                        'anchor it to something fixed, such as his position or a year')
    for pat in BANNED:
        if re.search(pat, text, re.I):
            problems.append(f'banned wording ({pat.strip(chr(92) + "b")})')

    pid = squads.find(player)
    if pid:
        # Every name has to add something. Names that all meet the player at one club (managers count)
        # only say "that club": Haaland, De Bruyne & Guardiola is just Man City (Lewis, 21 Nov 2026).
        by_name = {}
        for m in squads.teammates(pid) + squads.managers(pid):
            if squads._mentioned(m['name'], low):
                by_name.setdefault(m['name'], set()).add(m['club'])
        common = set.intersection(*by_name.values()) if len(by_name) >= 2 else set()
        if common:
            problems.append(f"every team-mate and manager named meets the player at {sorted(common)[0]}, so together "
                            f"they only say '{sorted(common)[0]}'; swap at least one for a name from another club, "
                            "a loan or the national team, ideally a surprising one")
        # Household names only say the obvious clubs (Lewis on Palmer, 22 Nov 2026: "Pep Guardiola and Xabi
        # Alonso hugely narrows it down... this game used to be a bit more about obscurities").
        famous = [m for m in squads.teammates(pid) + squads.managers(pid)
                  if squads._mentioned(m['name'], low) and _household(m)]
        # top managers count from the wording too: the squad data ends in July 2026, after some appointments
        named = set(by_name) | {e for e in ELITE_MANAGERS if re.search(rf'\b{e}\b', low)}
        famous_names = {m['name'] for m in famous} | {e for e in ELITE_MANAGERS if re.search(rf'\b{e}\b', low)}
        famous_names = {f for f in famous_names if not any(f != g and f in squads.norm(g) for g in famous_names)}
        named = {f for f in named if not any(f != g and f in squads.norm(g) for g in named)}
        if len(named) >= 2 and len(famous_names) >= len(named):
            problems.append('every name is a household name (' + ', '.join(sorted(famous_names)) +
                            '), which points straight at his best-known clubs; keep one at most and add team-mates '
                            'from a loan, an early club or an unexpected spell')
    n = len(text.split())
    if n < 15:
        problems.append(f'too short ({n} words)')
    if n > 65:
        problems.append(f'too long ({n} words; Lewis\'s originals are 20 to 40)')
    return sorted(set(problems))


def style(player, text):
    return _cached('style', _key(STYLE_SYSTEM, player, text), lambda: llm.chat_json(
        llm.CHECKER, STYLE_SYSTEM, f'Originals for comparison:\n\n{examples()}\n\n---\n\nAnswer: {player}\n'
        f'Question to judge:\n{text}', STYLE_SCHEMA, temperature=0.0, max_tokens=600))


def problems_of(c):
    out = list(c['lint'])
    for cl in c['claims']:
        if cl['final'] == 'CONTRADICTED':
            out.append(f'claim is wrong: "{cl["text"]}"')
        elif cl['final'] == 'NOT_FOUND':
            out.append(f'claim not stated in the evidence: "{cl["text"]}"')
    for name, why in c['others'].items():
        out.append(f'another player also fits every clue: {name} ({why})')
    t, d = c.get('target'), c.get('style', {}).get('difficulty')
    if t and d and d < t - 1:
        out.append(f'too easy for its place in the pack: judged {d} of 5, wanted about {t}. Lead with a '
                   'lesser-known fact and name a surprising team-mate or manager')
    if c['dated']:
        out.append('wording will date: ' + '; '.join(q.get('datedWhy', '') for q in c['quality'].values()
                                                     if q.get('datedWording')))
    return out


def rank(c):
    return (len(problems_of(c)) == 0, c.get('style', {}).get('score', 0), -len(problems_of(c)))


# ---------------------------------------------------------------- the run

PARTICLES = {'van', 'von', 'de', 'der', 'den', 'da', 'di', 'del', 'dos', 'das', 'du', 'la', 'le', 'mac', 'ter'}
SUFFIXES = {'junior', 'jr', 'filho', 'neto'}
PLAIN = str.maketrans({'ø': 'o', 'Ø': 'O', 'æ': 'ae', 'Æ': 'AE', 'œ': 'oe', 'Œ': 'OE', 'ß': 'ss', 'đ': 'd', 'Đ': 'D',
                       'ł': 'l', 'Ł': 'L', 'ı': 'i'})


def plain(s):
    """Without accents: Guimarães -> Guimaraes, Ødegaard -> Odegaard, Groß -> Gross."""
    import unicodedata
    return ''.join(c for c in unicodedata.normalize('NFKD', s.translate(PLAIN)) if not unicodedata.combining(c))


def answers_for(player, prof):
    """Full name and surname, as in Lewis's packs, plus their plain spellings (Agüero, Aguero): people
    leave accents out and must never be blocked for it (Lewis, 22 Nov 2026). The surname keeps its
    particle (Van Dijk, De Bruyne, Mac Allister), skips "Júnior" (Vinícius), and may be short (Eze).
    Names written surname first (Son Heung-min, Hwang Hee-chan) need their surname added by hand."""
    names = [player]
    tm = prof.get('name')
    if tm and squads.norm(tm) != squads.norm(player):
        names.append(tm)
    words = player.split()
    while len(words) > 1 and squads.norm(words[-1]) in SUFFIXES:
        words = words[:-1]          # Vinícius Júnior -> Vinícius
    if len(words) == 1 and words[0] != player:
        names.append(words[0])
    elif len(words) > 1:
        last = words[-1]
        if len(words) > 2 and squads.norm(words[-2]) in PARTICLES:
            last = words[-2][0].upper() + words[-2][1:] + ' ' + words[-1]   # van Dijk -> Van Dijk
        if len(squads.norm(last).replace(' ', '')) >= 3:
            names.append(last)
    names = list(dict.fromkeys(names))
    return list(dict.fromkeys(names + [plain(n) for n in names]))


def check(cands, players):
    """Fact-check, uniqueness, dated wording and style for a list of candidates, in model batches."""
    items = [{'player': c['player'], 'question': c['question'], 'lines': players[c['player']]['lines']}
             for c in cands]
    factcheck.run_batch(items)          # Qwen then Gemma, each loaded once
    for c, it in zip(cands, items):
        c.update(claims=it['claims'], others=it['others'], dated=it['dated'], quality=it['quality'])
    for c in cands:                     # style is judged by Qwen
        c['style'] = style(c['player'], c['question']) if not c['lint'] else {'score': 0, 'why': 'lint'}
    llm.unload(llm.CHECKER)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pack')
    ap.add_argument('--limit', type=int)
    ap.add_argument('--only', action='append')
    a = ap.parse_args()
    src = HERE / a.pack
    # One player per line, optionally with a difficulty target: "Jesse Lingard @4".
    targets = {}
    for l in src.read_text().splitlines():
        if l.strip() and not l.startswith('#'):
            name, _, t = l.strip().partition(' @')
            targets[name.strip()] = int(t) if t.strip().isdigit() else None
    names = list(targets)
    if a.only:
        names = [n for n in names if n in a.only]
    if a.limit:
        names = names[:a.limit]
    out_dir = HERE / 'out' / src.stem
    out_dir.mkdir(parents=True, exist_ok=True)

    players = {}
    for n in names:
        doc, lines, squad = evidence(n)
        flags, prof = profile_clues(n)
        prof['contract'] = squads._q('select contract_expiration_date from players where player_id = ?',
                                     squads.find(n))[0][0] if squads.find(n) else None
        players[n] = {'doc': doc, 'lines': lines, 'ev': lines + squad, 'flags': flags, 'prof': prof,
                      'answers': answers_for(n, prof)}
        print(f'[pack] evidence {n}: {len(lines)} lines, {len(squad)} squad', file=sys.stderr, flush=True)

    t0 = time.time()
    cands = []
    for n in names:                      # Gemma writes everything first
        p = players[n]
        try:
            ds = draft(n, p['ev'], targets[n])
        except llm.BadOutput as e:
            print(f'[pack] no draft for {n}: {e}', file=sys.stderr, flush=True)
            continue
        for d in ds:
            q = clean(d['question'])
            cands.append({'player': n, 'round': 0, 'hook': d['hook'], 'question': q, 'target': targets[n],
                          'writerClaims': d['claims'], 'lint': lint(n, p['answers'], q)})
    llm.unload(llm.WRITER)
    print(f'[pack] {len(cands)} drafts in {time.time() - t0:.0f}s', file=sys.stderr, flush=True)
    check(cands, players)

    for rnd in range(1, ROUNDS + 1):
        todo = []
        for n in names:
            mine = [c for c in cands if c['player'] == n]
            if not mine or any(not problems_of(c) and c['style'].get('score', 0) >= 4 for c in mine):
                continue
            best = max(mine, key=rank)
            probs = problems_of(best) or [f"the voice needs work: {best['style'].get('why', '')} "
                                          f"{best['style'].get('fix', '')}"]
            try:
                ds = revise(n, players[n]['ev'], best['question'], probs, rnd, targets[n])
            except llm.BadOutput:
                continue
            for d in ds:
                q = clean(d['question'])
                todo.append({'player': n, 'round': rnd, 'hook': d['hook'], 'question': q, 'target': targets[n],
                             'writerClaims': d['claims'], 'lint': lint(n, players[n]['answers'], q),
                             'revisedFrom': best['question'], 'problemsFixed': probs})
        llm.unload(llm.WRITER)
        print(f'[pack] round {rnd}: {len(todo)} revisions', file=sys.stderr, flush=True)
        if not todo:
            break
        check(todo, players)
        cands += todo

    summary = []
    for n in names:
        mine = sorted([c for c in cands if c['player'] == n], key=rank, reverse=True)
        if not mine:
            continue
        p = players[n]
        ret = retired(n, p['lines'], p['prof'])
        best = mine[0]
        rec = {
            'answer': n,
            'acceptableAnswers': p['answers'],
            'clues': {**p['flags'], 'RET': ret['retired']},
            'retiredEvidence': ret,
            'target': targets[n],
            'status': 'READY' if not problems_of(best) and best['style'].get('score', 0) >= 4 else 'NEEDS_WORK',
            'question': best['question'],
            'problems': problems_of(best),
            'style': best['style'],
            'claims': [{'text': c['text'], 'final': c['final'],
                        'quotes': [r.get('supportQuote') for r in c['models'].values() if r.get('final') == 'SUPPORTED']}
                       for c in best['claims']],
            'source': {'url': p['doc']['url'], 'revid': p['doc']['revid']},
            'alternatives': [{'question': c['question'], 'problems': problems_of(c),
                              'style': c['style'].get('score')} for c in mine[1:]],
        }
        write_json(out_dir / f"{n.replace(' ', '_')}.json", rec, indent=1)
        summary.append(rec)
    llm.unload(llm.CHECKER)
    write_json(HERE / 'out' / f'{src.stem}.json', summary, indent=1)
    ready = sum(r['status'] == 'READY' for r in summary)
    print(f'[pack] {ready} ready, {len(summary) - ready} need work, {time.time() - t0:.0f}s', file=sys.stderr)


if __name__ == '__main__':
    main()
