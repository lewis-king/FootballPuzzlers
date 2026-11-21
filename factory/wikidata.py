"""Deterministic player facts from Wikidata: resolve players by name, then read
birthplace (for the ENG clue), positions and date of birth. No LLM involved.

Request budget: names resolve 50 at a time through Wikipedia page titles, entities load
50 at a time, and birthplaces walk up to England in batched entity reads (no SPARQL). Only names that miss
fall back to a one-by-one search. All traffic goes through polite_http.
Results are cached in factory/cache/wikidata.json so reruns cost nothing.
"""
import json
import pathlib

from polite_http import get_json
from cachefile import read_json, write_json

WIKIPEDIA = 'https://en.wikipedia.org/w/api.php'
API = 'https://www.wikidata.org/w/api.php'
FOOTBALLER = 'Q937857'   # occupation: association football player
ENGLAND = 'Q21'
CACHE = pathlib.Path(__file__).parent / 'cache' / 'wikidata.json'
BATCH = 50

POSITION_CLUE = {        # Wikidata position item -> app clue
    'Q201330': 'GK', 'Q336286': 'DEF', 'Q193592': 'MID', 'Q280658': 'FWD',
    'Q1050571': 'DEF', 'Q4115189': 'DEF', 'Q1756342': 'DEF', 'Q1196129': 'DEF',
    'Q1373216': 'MID', 'Q2665426': 'MID', 'Q19801281': 'MID', 'Q842390': 'MID',
    'Q1196121': 'FWD', 'Q627256': 'FWD', 'Q15727799': 'FWD',
}


def _chunks(xs, n=BATCH):
    return [xs[i:i + n] for i in range(0, len(xs), n)]


def _load_cache():
    return read_json(CACHE) or {}


def _save_cache(cache):
    CACHE.parent.mkdir(exist_ok=True)
    write_json(CACHE, cache, indent=1)


def _footballers(qids):
    """Subset of qids whose occupation includes association football player."""
    keep = set()
    for chunk in _chunks(sorted(set(qids))):
        ents = get_json(API, {'action': 'wbgetentities', 'ids': '|'.join(chunk),
                              'props': 'claims', 'format': 'json'})['entities']
        for q, e in ents.items():
            occ = {c['mainsnak'].get('datavalue', {}).get('value', {}).get('id')
                   for c in e.get('claims', {}).get('P106', [])}
            if FOOTBALLER in occ:
                keep.add(q)
    return keep


def _via_wikipedia(names):
    """name -> QID using exact Wikipedia titles (follows redirects), 50 names per request."""
    found = {}
    for chunk in _chunks(names):
        r = get_json(WIKIPEDIA, {'action': 'query', 'titles': '|'.join(chunk), 'redirects': 1,
                                 'prop': 'pageprops', 'ppprop': 'wikibase_item', 'format': 'json',
                                 'formatversion': 2})['query']
        alias = {n['from']: n['to'] for n in r.get('normalized', [])}
        alias.update({d['from']: d['to'] for d in r.get('redirects', [])})
        by_title = {p['title']: p.get('pageprops', {}).get('wikibase_item') for p in r.get('pages', [])}
        for n in chunk:
            t = n
            for _ in range(3):  # normalised -> redirect chain
                t = alias.get(t, t)
            if by_title.get(t):
                found[n] = by_title[t]
    return found


def _via_search(name):
    hits = get_json(API, {'action': 'wbsearchentities', 'search': name, 'language': 'en',
                          'type': 'item', 'limit': 10, 'format': 'json'}).get('search', [])
    ids = [h['id'] for h in hits]
    ok = _footballers(ids) if ids else set()
    return next((i for i in ids if i in ok), None)


def resolve_all(names, cache):
    todo = [n for n in names if 'qid:' + n not in cache]
    if todo:
        guess = _via_wikipedia(todo)
        good = _footballers(guess.values()) if guess else set()
        for n in todo:
            if guess.get(n) in good:
                cache['qid:' + n] = guess[n]
        _save_cache(cache)
        for n in todo:  # disambiguation pages, non-footballer namesakes, missing titles
            if 'qid:' + n not in cache:
                cache['qid:' + n] = _via_search(n)
                _save_cache(cache)
    return {n: cache['qid:' + n] for n in names}


def _entities(ids, props='claims|labels'):
    out = {}
    for chunk in _chunks(sorted(set(ids))):
        out.update(get_json(API, {'action': 'wbgetentities', 'ids': '|'.join(chunk), 'props': props,
                                  'languages': 'en', 'format': 'json'})['entities'])
    return out


def _claim_ids(entity, prop):
    return [c['mainsnak'].get('datavalue', {}).get('value', {}).get('id')
            for c in entity.get('claims', {}).get(prop, []) if c.get('rank') != 'deprecated']


def facts(qids, cache):
    """Birthplace, born-in-England, positions and DOB, using only batched entity reads.

    Born in England = the birthplace, followed up 'located in' (P131) links, reaches England (Q21).
    Places are cached across runs, so later runs mostly skip the walk.
    """
    players = _entities(qids)
    places = cache.setdefault('places', {})   # place qid -> {'label', 'parents'}
    frontier = set()
    for e in players.values():
        frontier.update(q for q in _claim_ids(e, 'P19') if q)
    for _ in range(8):  # town -> district -> county -> region -> England
        todo = [q for q in frontier if q not in places]
        if not todo:
            break
        for q, e in _entities(todo).items():
            places[q] = {'label': e.get('labels', {}).get('en', {}).get('value'),
                         'parents': [p for p in _claim_ids(e, 'P131') if p]}
        frontier = {p for q in todo for p in places.get(q, {}).get('parents', [])}
    _save_cache(cache)

    def in_england(q, seen=()):
        if q == ENGLAND:
            return True
        if q in seen or q not in places:
            return False
        return any(in_england(p, seen + (q,)) for p in places[q]['parents'])

    out = {}
    for q, e in players.items():
        birth = _claim_ids(e, 'P19')
        dob = e.get('claims', {}).get('P569', [{}])[0].get('mainsnak', {}).get('datavalue', {}).get('value', {})
        out[q] = {
            'label': e.get('labels', {}).get('en', {}).get('value'),
            'birthplace': places.get(birth[0], {}).get('label') if birth else None,
            'dob': dob.get('time', '')[1:11] if dob else '',
            'bornInEngland': any(in_england(b) for b in birth) if birth else None,
            'positions': sorted({POSITION_CLUE[p] for p in _claim_ids(e, 'P413') if p in POSITION_CLUE}),
        }
    return out


def lookup(names):
    cache = _load_cache()
    qids = resolve_all(sorted(set(names)), cache)
    found = sorted({q for q in qids.values() if q})
    data = facts(found, cache)
    return {n: ({'qid': q, **data.get(q, {})} if q else None) for n, q in qids.items()}
