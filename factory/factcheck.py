"""Claim-level fact checking against Wikipedia evidence.

Pipeline for one question:
1. atomise: split the question into atomic claims, each tagged with a kind.
2. retrieve: per claim, pick the most relevant evidence lines (keyword overlap) plus every list
   line (Honours, statistics), so long articles are never truncated and negative claims can be settled.
3. check: the model must first list every relevant line, then give a verdict. Negative, sequence
   and superlative claims get an explicit procedure, because those are where checkers wave errors through.
4. guard: quotes are matched against the evidence in code; an invented quote cannot support a claim.
5. ensemble: every claim is checked by two different model families; the strictest verdict wins.

Results are cached by (model, prompt version, claim, evidence) so eval reruns only pay for what changed.
"""
import hashlib
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import llm  # noqa: E402
from cachefile import read_json, write_json

CACHE = pathlib.Path(__file__).parent / 'cache' / 'factcheck'
MODELS = [llm.CHECKER, llm.WRITER]   # two families: Qwen and Gemma
KINDS = ['FACT', 'NUMBER', 'NEGATIVE', 'SEQUENCE', 'SUPERLATIVE', 'RELATION']

ATOM_SCHEMA = {
    'type': 'object',
    'properties': {'claims': {'type': 'array', 'items': {
        'type': 'object',
        'properties': {'text': {'type': 'string', 'maxLength': 300}, 'kind': {'type': 'string', 'enum': KINDS}},
        'required': ['text', 'kind']}}},
    'required': ['claims'],
}

ATOM_SYSTEM = """Split a football quiz question into atomic factual claims about the answer player.
- One checkable fact per claim. "I won the FA Cup and the League Cup with Chelsea" is two claims.
- Rewrite each claim in the third person with the player's name, resolving "my club", "my country",
  "the following year", "my next final" into explicit terms ONLY where the question itself makes them
  clear. Never reinterpret: "I lost the 2005 FA Cup final but won my next final" claims that the very
  next final he played after 2005, whatever the competition, was won. Keep the
  original words when in doubt; a rewrite that makes a claim easier to satisfy is a serious error.
- Keep every number, year, round, club and qualifier exactly as the question states it.
- Hidden claims count: "I've never won the league" is a claim; "Although I won X, ..." claims X.
- Only claims about the player and what happened to him. Skip general knowledge that is not about him
  (which city a club is in, what a competition is).
- kind: NEGATIVE for never / only / not a single / no other / just once; SEQUENCE for next / following /
  then / after / before / first time / in the same year; SUPERLATIVE for record / first / most / fastest /
  youngest / oldest / only player; NUMBER for counts and scores; RELATION for team-mates, managers,
  family, opponents; FACT for anything else."""

CHECK_SCHEMA = {
    'type': 'object',
    'properties': {
        'relevantLines': {'type': 'array', 'maxItems': 15, 'items': {'type': 'object', 'properties': {
            'n': {'type': 'integer'}, 'says': {'type': 'string', 'maxLength': 200}}, 'required': ['n', 'says']}},
        'supportQuote': {'type': 'string', 'maxLength': 400},
        'contradictQuote': {'type': 'string', 'maxLength': 400},
        'verdict': {'type': 'string', 'enum': ['SUPPORTED', 'CONTRADICTED', 'NOT_FOUND']},
        'reasoning': {'type': 'string', 'maxLength': 500},
    },
    'required': ['relevantLines', 'supportQuote', 'contradictQuote', 'verdict', 'reasoning'],
}

PROCEDURE = {
    'NEGATIVE': 'This claim says something NEVER happened, or happened only a set number of times. First list '
                'EVERY evidence line that records an instance of it, including Honours lines and lines about '
                'other countries, lower divisions and youth or early careers ("never won the league" is false '
                'if he won ANY national league title anywhere, unless the claim names one league). It is '
                'SUPPORTED only if the evidence covers his whole career and shows no other instance.',
    'SEQUENCE': 'This claim depends on order in time. First list every relevant event with its date, in date '
                'order, then check the claim against that ordered list ("my next final" means the very next '
                'one after the one mentioned, including finals he lost).',
    'SUPERLATIVE': 'This claim is a record or a first/only/most. It is SUPPORTED only if a line states the record '
                   'itself. A line saying he did something is not evidence that nobody else did it. Look also for '
                   'lines saying the record was broken, equalled or shared.',
    'NUMBER': 'Check every number, score and year exactly. "Over 50" needs a line with a number above 50.',
    'RELATION': 'Check who is who: a manager is not a team-mate, an opponent is not "my club", and a team-mate '
                'must have been at the same club or national team at the same time. Lines starting "[Squad data" '
                'come from match line-ups and settle team-mate and manager claims from 2012-13 on: a pairing listed '
                'there is SUPPORTED (quote that line). If the claim names a club, the squad line must show that club.',
    'FACT': 'Check every detail in the claim, including the round of a competition, the club and the year.',
}

CHECK_SYSTEM = """You are a meticulous football fact-checker. Judge ONE claim using ONLY the numbered evidence.
It is now November 2026. The evidence is current to then: events in 2025 and 2026 that it describes have happened, so never treat them as future or hypothetical.
Fill relevantLines first: every line that bears on the claim, for or against, with what it says.
Then decide:
- SUPPORTED: a line states the claim, with every detail matching. Copy that line's words exactly into supportQuote.
- CONTRADICTED: a line shows any detail is wrong (year, round, club, count, who did it). Copy it into contradictQuote.
- NOT_FOUND: the evidence neither states nor contradicts it.
A claim with one wrong detail is CONTRADICTED even if the rest is right. Leave unused quotes empty."""

STOP = set('the a an and or of in on at to for with by from as is was were be been i my me he his him '
           'they their it its that this which who whom have has had not no did do does than then also '
           'player club team only never'.split())


def _hash(*parts):
    return hashlib.sha256(json.dumps(parts, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:20]


PROMPT_VERSION = _hash(ATOM_SYSTEM, CHECK_SYSTEM, PROCEDURE, ATOM_SCHEMA, CHECK_SCHEMA)


def _cached(key, fn):
    CACHE.mkdir(parents=True, exist_ok=True)
    f = CACHE / f'{key}.json'
    hit = read_json(f)
    if hit is not None:
        return hit
    out = fn()
    write_json(f, out)
    return out


def _tokens(s):
    s = s.lower().replace('–', '-')
    toks = set(re.findall(r"[a-zà-ÿ0-9]+", s)) - STOP
    for a, b in re.findall(r'\b(\d{4})-(\d{2})\b', s):   # 2012-13 also matches 2012 and 2013
        toks.update({a, a[:2] + b})
    return toks


def retrieve(claim, lines, k=40):
    """Indices of the lines most relevant to a claim, plus every list line, in article order."""
    want = _tokens(claim)
    scored = sorted(((len(want & _tokens(l)), i) for i, l in enumerate(lines)), reverse=True)
    keep = {i for s, i in scored[:k] if s > 0}
    keep |= {j for i in list(keep) for j in (i - 1, i + 1) if 0 <= j < len(lines)}   # context
    keep |= {i for i, l in enumerate(lines) if l.startswith('[')}                   # honours, stats
    return sorted(keep)


def _norm(s):
    s = re.sub(r'^\[[^\]]*\]\s*', '', s or '')
    return re.sub(r'[^a-z0-9]+', ' ', s.lower().replace('–', '-')).strip()


def quote_found(quote, lines):
    q = _norm(quote)
    if len(q) < 12:
        return False
    return any(q in _norm(l) or _norm(l) in q and len(_norm(l)) > 20 for l in lines)


def atomise(player, question, model=llm.CHECKER):
    key = _hash('atom', model, PROMPT_VERSION, player, question)
    return _cached(key, lambda: llm.chat_json(
        model, ATOM_SYSTEM, f'Answer player: {player}\n\nQuestion:\n{question}', ATOM_SCHEMA,
        temperature=0.0, num_ctx=16384, max_tokens=1200))['claims']


PAGES_SCHEMA = {'type': 'object', 'properties': {'titles': {'type': 'array', 'maxItems': 3, 'items': {
    'type': 'string', 'maxLength': 120}}}, 'required': ['titles']}


def suggest_pages(player, claim, model):
    """Ask the model which English Wikipedia articles would settle the claim (a season, a final, a
    tournament, a record list). The model only chooses where to look; the pages are the evidence."""
    key = _hash('pages', model, player, claim)
    return _cached(key, lambda: llm.chat_json(
        model, 'You know English Wikipedia well. Name up to 3 exact article titles, other than the player\'s own '
               'article, most likely to confirm or refute the claim: e.g. a club season article ("2017–18 A.S. Roma '
               'season"), a final ("2010 UEFA Champions League final"), a tournament, or a records list.',
        f'Player: {player}\nClaim: {claim}', PAGES_SCHEMA, temperature=0.0, num_ctx=16384, max_tokens=300))['titles']


def extra_lines(player, claim, model, limit=3):
    """Second-chance evidence when the player's own article doesn't settle the claim: pages the model
    suggests (resolved through Wikipedia search so a near-miss title still lands), then plain search."""
    import wikipedia
    titles = []
    for t in suggest_pages(player, claim, model):
        hits = wikipedia.search(t, 1)
        titles += hits[:1]
    titles += wikipedia.search(claim, 2)
    out, seen = [], set()
    for t in titles:
        if t in seen or len(seen) >= limit:
            continue
        seen.add(t)
        if _same(t, player):
            continue
        try:
            doc = wikipedia.article(t)
        except LookupError:
            continue
        out += [f'({doc["title"]}) {l}' for l in wikipedia.sentences(doc['text'])]
    return out


def check_claim(player, claim, lines, model, escalate=True):
    r = _check(player, claim, lines, model)
    if escalate and r['final'] != 'SUPPORTED':
        more = extra_lines(player, claim['text'], model)
        if more:
            r2 = _check(player, claim, lines + more, model, k=60)
            r2['escalated'] = True
            r2['first'] = r['final']
            return r2
    return r


def _check(player, claim, lines, model, k=40):
    idx = retrieve(claim['text'], lines, k)
    ev = '\n'.join(f'[{i}] {lines[i]}' for i in idx)
    kind = claim.get('kind', 'FACT')
    user = (f'Player: {player}\nClaim ({kind}): {claim["text"]}\n\nProcedure: {PROCEDURE.get(kind, PROCEDURE["FACT"])}'
            f'\n\nEvidence:\n{ev}')
    key = _hash('check', model, PROMPT_VERSION, player, claim, ev)
    r = _cached(key, lambda: llm.chat_json(model, CHECK_SYSTEM, user, CHECK_SCHEMA, temperature=0.0,
                                           num_ctx=16384, max_tokens=2000))
    r = dict(r)
    r['supportFound'] = quote_found(r['supportQuote'], lines)
    r['contradictFound'] = quote_found(r['contradictQuote'], lines)
    # Code, not the model, has the last word on quotes.
    if r['verdict'] == 'SUPPORTED' and not r['supportFound']:
        r['final'] = 'NOT_FOUND'
        r['guard'] = 'support quote not in evidence'
    elif r['verdict'] == 'CONTRADICTED' and not r['contradictFound']:
        r['final'] = 'NOT_FOUND'        # unproven contradiction still fails the claim, just less loudly
        r['guard'] = 'contradiction quote not in evidence'
    else:
        r['final'] = r['verdict']
    return r


RANK = {'SUPPORTED': 0, 'NOT_FOUND': 1, 'CONTRADICTED': 2}


def combine(per_model):
    """One verdict from the models' (quote-checked) verdicts.

    SUPPORTED: at least one model quoted a line that states it, and none quoted a contradiction.
    CONTRADICTED: a model quoted a contradiction and none quoted support.
    NOT_FOUND: neither, or the models disagree with quotes on both sides; a person decides.
    The November 2026 eval chose this over "strictest wins", which failed 72% of true questions because
    one model often misses a line the other finds; this rule kept 69 of 70 false questions out of PASS."""
    v = [r['final'] for r in per_model.values()]
    if 'SUPPORTED' in v and 'CONTRADICTED' not in v:
        return 'SUPPORTED'
    if 'CONTRADICTED' in v and 'SUPPORTED' not in v:
        return 'CONTRADICTED'
    return 'NOT_FOUND'


def check_question(player, question, lines, models=MODELS):
    """Full check with every model. For batches, prefer run_batch, which loads each model once."""
    claims = atomise(player, question)
    out = []
    for c in claims:
        per = {m: check_claim(player, c, lines, m) for m in models}
        out.append({**c, 'models': per, 'final': combine(per)})
    return out


QUALITY_SCHEMA = {
    'type': 'object',
    'properties': {
        'otherPlayersWhoFit': {'type': 'array', 'maxItems': 8, 'items': {'type': 'object', 'properties': {
            'name': {'type': 'string', 'maxLength': 60}, 'why': {'type': 'string', 'maxLength': 200}}, 'required': ['name', 'why']}},
        'datedWording': {'type': 'boolean'},
        'datedWhy': {'type': 'string', 'maxLength': 250},
    },
    'required': ['otherPlayersWhoFit', 'datedWording', 'datedWhy'],
}

QUALITY_SYSTEM = """You review football quiz questions written in the voice of a mystery player.
It is now November 2026. The evidence is current to then: events in 2025 and 2026 that it describes have happened, so never treat them as future or hypothetical.
1. Uniqueness: from your own football knowledge, list every OTHER player who fits EVERY clue in the question.
   Think about team-mates who shared the same match, trophy or comeback, and players with the same record.
   Ignore players who fit only some clues. An empty list means the answer is unique.
2. datedWording: true if the question says "currently", "still", "as of", "this season", or states a record,
   "first", "only", "most" or an all-time ranking in the present tense without tying it to a moment
   ("I hold the record", "I'm the only player"), or a count that could change while the player is active
   ("I've never won the league" for someone still playing).
   The test: would this sentence become FALSE if something new happened tomorrow? Only then is it dated.
   Past events anchored to a moment can never become false, so these are all fine: "In 2023 I became the
   first...", "I once held the record...", "I broke the club record for clean sheets", "by the end of
   2023-24 I had scored more own goals than any other goalkeeper", "I've been managed by X & Y",
   "I've won the FA Cup". Keep datedWhy to one short sentence."""


def quality(player, question, model):
    key = _hash('quality', model, PROMPT_VERSION, QUALITY_SYSTEM, player, question)
    return _cached(key, lambda: llm.chat_json(
        model, QUALITY_SYSTEM, f'Intended answer: {player}\n\nQuestion:\n{question}', QUALITY_SCHEMA,
        temperature=0.0, num_ctx=16384, max_tokens=1500))


def _same(a, b):
    a, b = _norm(a), _norm(b)
    return a == b or a in b or b in a


def run_batch(items, models=MODELS, facts=True):
    """items: [{'player', 'question', 'lines'}]. Loads each model once (they don't share the GPU).
    Adds per item: claims (with per-model verdicts), factsOk, others (union across models), dated."""
    if facts:
        import squads
        for it in items:
            # Team-mate and manager pairings come from match line-ups, which Wikipedia prose rarely lists.
            extra = squads.evidence_for(it['player'], it['question'])
            if extra:
                it['lines'] = it['lines'] + [l for l in extra if l not in it['lines']]
            try:
                it['claims'] = atomise(it['player'], it['question'])
            except llm.BadOutput:
                it['claims'] = [{'text': it['question'], 'kind': 'FACT'}]
    for m in models:
        for it in items:
            for c in it.get('claims', []):
                try:
                    c.setdefault('models', {})[m] = check_claim(it['player'], c, it['lines'], m)
                except llm.BadOutput as e:   # an unreadable answer fails the claim, never the run
                    c.setdefault('models', {})[m] = {'final': 'NOT_FOUND', 'guard': str(e)}
            try:
                it.setdefault('quality', {})[m] = quality(it['player'], it['question'], m)
            except llm.BadOutput as e:
                it.setdefault('quality', {})[m] = {'otherPlayersWhoFit': [], 'datedWording': False,
                                                   'datedWhy': f'ERROR {e}'}
        llm.unload(m)
    for it in items:
        for c in it.get('claims', []):
            c['final'] = combine(c['models'])
            if facts and c.get('kind') == 'RELATION':
                rv = squads.relation_verdict(it['player'], c['text'])
                if rv:
                    c['final'], c['squadData'] = rv
        it['factsOk'] = all(c['final'] == 'SUPPORTED' for c in it.get('claims', []))
        others = {}
        for m, q in it['quality'].items():
            for o in q['otherPlayersWhoFit']:
                if not _same(o['name'], it['player']):
                    others.setdefault(o['name'], o['why'])
        it['others'] = others
        # Both models must agree: one alone flagged plenty of safely anchored sentences in testing.
        it['dated'] = all(q['datedWording'] for q in it['quality'].values())
    return items
