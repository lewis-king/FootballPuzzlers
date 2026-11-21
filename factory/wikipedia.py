"""Plain-text Wikipedia articles as evidence, cached by revision id. All traffic via polite_http."""
import json
import pathlib
import re

from polite_http import get_json
from cachefile import read_json, write_json

API = 'https://en.wikipedia.org/w/api.php'
CACHE = pathlib.Path(__file__).parent / 'cache' / 'wikipedia'


def _fetch(title):
    r = get_json(API, {'action': 'query', 'titles': title, 'redirects': 1,
                       'prop': 'extracts|revisions|pageprops', 'ppprop': 'disambiguation|wikibase_item',
                       'explaintext': 1, 'rvprop': 'ids|timestamp', 'format': 'json', 'formatversion': 2})
    return r['query']['pages'][0]


def _footballer_title(name):
    """The footballer's own article when a plain name lands on a disambiguation page or a namesake."""
    import wikidata
    qid = wikidata.lookup([name]).get(name, {}) or {}
    qid = qid.get('qid')
    if not qid:
        return None
    e = get_json(wikidata.API, {'action': 'wbgetentities', 'ids': qid, 'props': 'sitelinks',
                                'sitefilter': 'enwiki', 'format': 'json'})['entities'][qid]
    return e.get('sitelinks', {}).get('enwiki', {}).get('title')


TITLES = json.loads((pathlib.Path(__file__).parent / 'titles.json').read_text())


def article(title):
    """Return {'title', 'revid', 'url', 'text'} for a footballer's page, following redirects.
    Ambiguous names are pinned in titles.json; otherwise a disambiguation page falls back to
    Wikidata's best footballer match, with a warning because that is a guess."""
    title = TITLES.get(title, title)
    CACHE.mkdir(parents=True, exist_ok=True)
    safe = re.sub(r'[^\w-]+', '_', title)
    hit = CACHE / f'{safe}.json'
    doc = read_json(hit)
    if doc is not None:
        if not doc.get('disambiguation'):
            return doc
    page = _fetch(title)
    if 'disambiguation' in page.get('pageprops', {}) or 'missing' in page:
        better = _footballer_title(title)
        if better and better != page.get('title'):
            import sys
            print(f'[wikipedia] "{title}" is ambiguous, guessed "{better}"; pin it in titles.json',
                  file=sys.stderr, flush=True)
            page = _fetch(better)
    if 'missing' in page:
        raise LookupError(f'No Wikipedia article for "{title}"')
    doc = {
        'title': page['title'],
        'revid': page['revisions'][0]['revid'],
        'fetched': page['revisions'][0]['timestamp'],
        'url': 'https://en.wikipedia.org/wiki/' + page['title'].replace(' ', '_'),
        'text': page.get('extract', ''),
        'disambiguation': 'disambiguation' in page.get('pageprops', {}),
    }
    write_json(hit, doc)
    return doc


LIST_SECTIONS = re.compile(r'honours|career statistics|records|international goals', re.I)


def sentences(text):
    """Split article text into evidence lines the verifier can quote by number.

    Prose is split into sentences. In list sections (Honours, statistics) every short line is kept and
    prefixed with its section and group, because "UEFA Champions League: 2012–13" means nothing
    without the "Bayern Munich" line above it, and negative claims ("never won the league") are
    settled by these lists.
    """
    text = re.sub(r'\n=+ (References|External links|See also|Notes|Further reading)\s*=+[\s\S]*', '', text)
    out, section, group = [], '', ''
    for raw in text.split('\n'):
        line = raw.strip()
        if not line:
            continue
        h = re.match(r'^(=+)\s*(.*?)\s*=+$', line)
        if h:
            if len(h.group(1)) == 2:
                section = h.group(2)
            else:
                section = section.split(' > ')[0] + ' > ' + h.group(2)
            group = ''
            continue
        if LIST_SECTIONS.search(section):
            if ':' not in line and len(line) < 60 and not line.endswith('.'):
                group = line          # a club or team heading inside the list
                continue
            out.append(f"[{section}{' > ' + group if group else ''}] {line}")
            continue
        for p in re.split(r'(?<=[.!?])\s+(?=[A-Z0-9"\'])', line):
            if len(p.strip()) > 25:
                out.append(p.strip())
    return out


def search(query, n=3):
    """Titles of the top Wikipedia articles for a query (one cached request)."""
    CACHE.mkdir(parents=True, exist_ok=True)
    f = CACHE / ('search_' + re.sub(r'[^\w-]+', '_', query)[:120] + '.json')
    cached = read_json(f)
    if cached is not None:
        return cached
    r = get_json(API, {'action': 'query', 'list': 'search', 'srsearch': query, 'srlimit': n,
                       'srprop': '', 'format': 'json', 'formatversion': 2})
    if 'query' not in r:
        # e.g. a query the search engine rejects; not cached, so a later run can retry
        import sys
        print(f'[wikipedia] search failed for {query!r}: {str(r.get("error", r))[:200]}', file=sys.stderr, flush=True)
        return []
    titles = [h['title'] for h in r['query']['search']]
    write_json(f, titles)
    return titles
