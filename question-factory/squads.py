"""Who played with whom, and under which manager, from match line-ups.

Source: transfermarkt-datasets (github.com/dcaribou/transfermarkt-datasets, CC0), a DuckDB snapshot of
Transfermarkt match data from 2012-13 to July 2026 across the main European leagues, cups and UEFA
competitions. One download, no scraping: `python3 question-factory/squads.py --download`.

Two players count as team-mates when both appeared for the same club in the same match; a manager
managed a player when he was in charge of the player's club in a match the player appeared in.
Pairings from before 2012-13 aren't covered here.
"""
import functools
import pathlib
import re
import sys
import unicodedata

HERE = pathlib.Path(__file__).parent
DB = HERE / 'cache' / 'transfermarkt' / 'tm.duckdb'
URL = 'https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data/transfermarkt-datasets.duckdb'
COVERS_FROM = 2012
# Exact Transfermarkt player ids for names that match more than one player.
IDS = {}


@functools.cache
def _db():
    import duckdb
    if not DB.exists():
        raise FileNotFoundError(f'{DB} missing: run python3 question-factory/squads.py --download')
    con = duckdb.connect(str(DB), read_only=True)
    # Clubs and national teams share the appearances table's club column.
    con.execute("""create temp view teams as
                   select club_id, name from clubs
                   union all select national_team_id, name from national_teams""")
    return con


def norm(s):
    s = unicodedata.normalize('NFKD', s or '').encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', ' ', s).strip()


def _q(sql, *params):
    return _db().execute(sql, list(params)).fetchall()


@functools.cache
def find(name):
    """Transfermarkt id for a player's name, or None. Ties go to the higher peak market value."""
    if name in IDS:
        return IDS[name]
    rows = _q("select player_id, name, highest_market_value_in_eur from players")
    target = norm(name)
    hits = [r for r in rows if norm(r[1]) == target]
    if not hits:   # same words in another order ("Son Heung-min" is "Heung-min Son" there)
        words = sorted(target.split())
        hits = [r for r in rows if sorted(norm(r[1]).split()) == words]
    if not hits:
        return None
    return max(hits, key=lambda r: r[2] or 0)[0]


@functools.cache
def profile(pid):
    r = _q("""select name, position, sub_position, country_of_citizenship, date_of_birth, last_season,
                     current_club_name, international_caps, international_goals, highest_market_value_in_eur,
                     country_of_birth
              from players where player_id = ?""", pid)[0]
    keys = ['name', 'position', 'subPosition', 'citizenship', 'born', 'lastSeason', 'currentClub',
            'caps', 'intlGoals', 'peakValue', 'birthCountry']
    return dict(zip(keys, r))


# The app's position clues, as How to Play defines them: wingers count as midfielders and
# wing-backs as defenders, and a player can have more than one position.
CLUE_OF = {
    'Goalkeeper': 'GK',
    'Centre-Back': 'DEF', 'Left-Back': 'DEF', 'Right-Back': 'DEF', 'Sweeper': 'DEF', 'Defender': 'DEF',
    'Central Midfield': 'MID', 'Defensive Midfield': 'MID', 'Attacking Midfield': 'MID', 'Left Midfield': 'MID',
    'Right Midfield': 'MID', 'Left Winger': 'MID', 'Right Winger': 'MID', 'Midfield': 'MID', 'midfield': 'MID',
    'Centre-Forward': 'FWD', 'Second Striker': 'FWD', 'Attack': 'FWD',
}
SECOND_POSITION_SHARE = 0.33  # a second position counts from 33% of starts (Lewis, 22 Nov 2026; was 25%, 30% before that)


@functools.cache
def positions(pid):
    """{'MID': 0.86, 'FWD': 0.14}: share of starts in each clue position (line-ups, 2012-13 on)."""
    rows = _q("""select position, count(*) from game_lineups
                 where player_id = ? and type = 'starting_lineup' group by 1""", pid)
    total = sum(n for _, n in rows) or 1
    out = {}
    for pos, n in rows:
        if pos in CLUE_OF:
            out[CLUE_OF[pos]] = out.get(CLUE_OF[pos], 0) + n / total
    return out


def position_clues(pid):
    """Clue flags for positions: the main one plus any held for 33% of starts or more."""
    p = profile(pid)
    main = CLUE_OF.get(p.get('subPosition') or '', CLUE_OF.get(p.get('position') or '', None))
    shares = positions(pid)
    flags = {k: False for k in ('GK', 'DEF', 'MID', 'FWD')}
    if shares:
        flags[max(shares, key=shares.get)] = True
    elif main:
        flags[main] = True
    for k, v in shares.items():
        if v >= SECOND_POSITION_SHARE:
            flags[k] = True
    return flags


@functools.cache
def clubs(pid):
    """[(club, first, last, games)] in date order."""
    return _q("""select c.name, min(a.date), max(a.date), count(*) from appearances a
                 join teams c on c.club_id = a.player_club_id where a.player_id = ?
                 group by 1 order by 2""", pid)


@functools.cache
def teammates(pid):
    """Everyone who appeared in the same match for the same club, with fame and context."""
    rows = _q("""
        with mine as (select game_id, player_club_id from appearances where player_id = ?),
        shared as (
            select b.player_id, b.player_club_id club_id, count(*) games, min(b.date) first, max(b.date) last
            from appearances b join mine m on b.game_id = m.game_id and b.player_club_id = m.player_club_id
            where b.player_id <> ? group by 1, 2),
        home as (   -- the club each team-mate played most games for: where people know him from
            select player_id, arg_max(player_club_id, n) club_id from (
                select player_id, player_club_id, count(*) n from appearances
                where player_id in (select player_id from shared) group by 1, 2) group by 1)
        select s.player_id, p.name, c.name, s.games, s.first, s.last, p.highest_market_value_in_eur,
               p.international_caps, hc.name
        from shared s join players p using (player_id) join teams c on c.club_id = s.club_id
        join home h using (player_id) join teams hc on hc.club_id = h.club_id
        order by p.highest_market_value_in_eur desc nulls last""", pid, pid)
    keys = ['id', 'name', 'club', 'games', 'first', 'last', 'peakValue', 'caps', 'bestKnownAt']
    return [dict(zip(keys, r)) for r in rows]


@functools.cache
def managers(pid):
    rows = _q("""
        select case when g.home_club_id = a.player_club_id then g.home_club_manager_name
                    else g.away_club_manager_name end m, c.name, count(*), min(a.date), max(a.date)
        from appearances a join games g using (game_id) join teams c on c.club_id = a.player_club_id
        where a.player_id = ? group by 1, 2 having m is not null order by 3 desc""", pid)
    keys = ['name', 'club', 'games', 'first', 'last']
    return [dict(zip(keys, r)) for r in rows]


def _when(first, last):
    a, b = first.year, last.year
    return str(a) if a == b else f'{a} to {b}'


def line_teammate(t):
    return (f"[Squad data > {t['club']}] Played in {t['games']} match{'es' if t['games'] != 1 else ''} "
            f"alongside {t['name']} for {t['club']} ({_when(t['first'], t['last'])})")


def line_manager(m):
    return (f"[Squad data > {m['club']}] Was managed by {m['name']} at {m['club']} in {m['games']} "
            f"match{'es' if m['games'] != 1 else ''} ({_when(m['first'], m['last'])})")


def _mentioned(full_name, text_norm):
    """Is this person named in the text, by full name or surname? Surnames shorter than 4 letters
    only count with the full name (avoids "Ba", "Lee" matching everywhere)."""
    n = norm(full_name)
    if not n:
        return False
    if re.search(rf'\b{re.escape(n)}\b', text_norm):
        return True
    last = n.split()[-1]
    return len(last) >= 4 and re.search(rf'\b{re.escape(last)}\b', text_norm) is not None


PLAYED = re.compile(r'\b(play(ed|ing)? (with|alongside)|team ?mates?|alongside|same (team|side|club|squad))\b')
MANAGED = re.compile(r'\b(manag(ed|er|ers)|coach(ed|es)?|under)\b')
FILLER = set('has have had been was were is the a an of and with alongside played playing play by for at in his her '
             'team teammate teammates mate mates same side club squad managed manager managers coached coach under '
             'during career likes like such as including include included'.split())


def relation_verdict(player, claim):
    """Settle a team-mate or manager claim from line-ups when that is all the claim says.
    Returns (verdict, reason) or None to leave it to the models. Code, not a model, so "played with
    Guardiola" can never pass because Guardiola managed him."""
    pid = find(player)
    if pid is None:
        return None
    t = norm(claim)
    says_played, says_managed = bool(PLAYED.search(t)), bool(MANAGED.search(t))
    if says_played == says_managed:
        return None
    mates = [m for m in teammates(pid) if _mentioned(m['name'], t)]
    bosses = [m for m in managers(pid) if _mentioned(m['name'], t)]
    if says_played and bosses and not mates:
        return 'CONTRADICTED', f"{bosses[0]['name']} managed {player}; he was not a team-mate"
    found = mates if says_played else bosses
    if not found:
        return None          # not in the line-ups: maybe before 2012-13, so the models decide
    left = set(t.split()) - FILLER - set(norm(player).split())
    for f in found:
        left -= set(norm(f['name']).split()) | set(norm(f['club']).split())
    left -= {'fc', 'afc', 'cf', 'city', 'united'}
    if left:
        return None          # the claim says more than the pairing (a final, a year): models decide
    f = found[0]
    return 'SUPPORTED', (line_teammate(f) if says_played else line_manager(f))


def evidence_for(player, text):
    """Squad-data evidence lines for every team-mate or manager the text appears to name.
    A header line says what the data covers, so a checker can tell 'not in data' from 'false'."""
    pid = find(player)
    if pid is None:
        return []
    t = norm(text)
    out = []
    for m in managers(pid):
        if _mentioned(m['name'], t):
            out.append(line_manager(m))
    seen = set()
    for tm in teammates(pid):
        if _mentioned(tm['name'], t) and (tm['id'], tm['club']) not in seen:
            seen.add((tm['id'], tm['club']))
            out.append(line_teammate(tm))
    if out:
        cl = '; '.join(f'{c} {_when(a, b)}' for c, a, b, _ in clubs(pid))
        out.insert(0, f'[Squad data] Match line-ups (top divisions, main cups, UEFA competitions and major tournaments only; lower leagues and friendlies are missing, so this is not a full career) from {COVERS_FROM}-13 onwards. {player} appeared for: {cl}')
    return out


def clue_people(player, k_famous=12, k_surprise=8, k_managers=6):
    """Team-mates and managers worth naming in a question (see STYLE.md): the best known, and the
    ones you'd least expect, i.e. famous names met at a club the player is not known for, or names
    whose own fame comes from somewhere else."""
    pid = find(player)
    if pid is None:
        return None
    mine = clubs(pid)
    total = sum(g for *_, g in mine) or 1
    main = max(mine, key=lambda r: r[3])[0] if mine else None
    tms = [t for t in teammates(pid) if t['games'] >= 3 and (t['peakValue'] or 0) >= 15_000_000]
    famous = tms[:k_famous]

    def surprise(t):
        share = sum(g for c, *_, g in mine if c == t['club']) / total   # how much of his career was at that club
        elsewhere = t['bestKnownAt'] != t['club']                         # known for another club
        return (t['peakValue'] or 0) * (1.5 - share) * (1.4 if elsewhere else 1.0) * (1.3 if t['club'] != main else 1.0)

    rest = [t for t in tms if t not in famous]
    surprising = sorted(rest + famous, key=surprise, reverse=True)
    surprising = [t for t in surprising if t['club'] != main][:k_surprise]
    mgrs = [m for m in managers(pid) if m['games'] >= 5][:k_managers]
    return {'clubs': mine, 'famous': famous, 'surprising': surprising, 'managers': mgrs}


def download():
    import urllib.request
    DB.parent.mkdir(parents=True, exist_ok=True)
    tmp = DB.with_suffix('.part')
    req = urllib.request.Request(URL, headers={'User-Agent': 'who-am-i-question-factory'})
    with urllib.request.urlopen(req) as r, open(tmp, 'wb') as f:
        while chunk := r.read(1 << 20):
            f.write(chunk)
    tmp.replace(DB)


if __name__ == '__main__':
    if sys.argv[1:] == ['--download']:
        download()
    else:
        for name in sys.argv[1:]:
            c = clue_people(name)
            if c is None:
                print(name, 'not found')
                continue
            print(f'\n== {name}', [f'{c} {_when(a, b)} ({g})' for c, a, b, g in c['clubs']])
            print(' famous:', [f"{t['name']} ({t['club']})" for t in c['famous']])
            print(' surprising:', [f"{t['name']} ({t['club']}, known for {t['bestKnownAt']})" for t in c['surprising']])
            print(' managers:', [f"{m['name']} ({m['club']})" for m in c['managers']])
