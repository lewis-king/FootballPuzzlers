"""The only way the factory talks to the internet.

Rules, so an overnight run never upsets a source:
- One request at a time per host, with a minimum gap per host (HOST_GAP).
- Retry-After is always honoured; MediaWiki APIs get maxlag=5 so we back off when servers are busy.
- After a 429 the gap for that host doubles for the rest of the run (and is logged).
- Every request is logged to question-factory/cache/http.log with its status and wait.
- A host that keeps returning 429 stops the run instead of retrying forever.
"""
import json
import pathlib
import threading
import time
import urllib.error
import urllib.parse
import urllib.request

import os

# Wikimedia's User-Agent policy asks automated clients for contact details; anonymous
# clients are throttled much harder. Set FACTORY_CONTACT (a URL or email) to comply.
UA = ('football-quiz-factcheck/0.1 (offline question checker; low volume, cached'
      + (f'; {os.environ["FACTORY_CONTACT"]}' if os.environ.get('FACTORY_CONTACT') else '') + ')')
LOG = pathlib.Path(__file__).parent / 'cache' / 'http.log'

# Minimum seconds between requests to each host. Deliberately well inside published guidance.
HOST_GAP = {
    'www.wikidata.org': 5.0,
    'query.wikidata.org': 30.0,
    'en.wikipedia.org': 2.0,
}
DEFAULT_GAP = 3.0
MAX_429_PER_HOST = 10
MAX_RETRY_AFTER = 3600  # we're not in a rush: sit out penalty windows up to an hour, stop beyond that

_last = {}
_gap = dict(HOST_GAP)
_429s = {}
_lock = threading.Lock()


class RateLimited(RuntimeError):
    pass


def _log(line):
    LOG.parent.mkdir(exist_ok=True)
    with LOG.open('a') as f:
        f.write(time.strftime('%Y-%m-%dT%H:%M:%S ') + line + '\n')


def get_json(url, params):
    host = urllib.parse.urlparse(url).hostname
    if host.endswith('wikidata.org') and 'api.php' in url or host.endswith('wikipedia.org'):
        params = {**params, 'maxlag': 5}
    full = url + '?' + urllib.parse.urlencode(params)
    for attempt in range(6):
        with _lock:
            gap = _gap.get(host, DEFAULT_GAP)
            wait = _last.get(host, 0) + gap - time.monotonic()
            if wait > 0:
                time.sleep(wait)
            _last[host] = time.monotonic()
        req = urllib.request.Request(full, headers={'User-Agent': UA, 'Accept': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                body = json.load(r)
            if isinstance(body, dict) and body.get('error', {}).get('code') == 'maxlag':
                lag = float(body['error'].get('lag', 5))
                _log(f'MAXLAG {host} lag={lag}')
                time.sleep(max(5, lag))
                continue
            _log(f'200 {host} {url.rsplit("/", 1)[-1]}')
            return body
        except urllib.error.HTTPError as e:
            retry_after = int(e.headers.get('Retry-After') or 0)
            if e.code == 429:
                _429s[host] = _429s.get(host, 0) + 1
                _gap[host] = _gap.get(host, DEFAULT_GAP) * 2
                _log(f'429 {host} retry_after={retry_after} new_gap={_gap[host]}')
                if retry_after > MAX_RETRY_AFTER:
                    raise RateLimited(f'{host} asked us to wait {retry_after}s; pausing this source')
                if _429s[host] >= MAX_429_PER_HOST:
                    raise RateLimited(f'{host} rate-limited {_429s[host]} times; stopping run')
            elif e.code in (500, 502, 503, 504):
                _log(f'{e.code} {host}')
            else:
                raise
            time.sleep(max(retry_after, 10 * 2 ** attempt))
        except (urllib.error.URLError, TimeoutError) as e:
            _log(f'NETERR {host} {e}')
            time.sleep(10 * 2 ** attempt)
    raise RuntimeError(f'gave up on {host} after retries')


def stats():
    return {'429s': dict(_429s), 'gaps': dict(_gap)}
