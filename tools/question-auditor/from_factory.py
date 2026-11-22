#!/usr/bin/env python3
"""Turn an assembled factory pack into a review for the auditor (items of kind "new").

    question-factory/.venv/bin/python tools/question-auditor/from_factory.py 2020s "The 2020s" 2020s
    question-factory/.venv/bin/python tools/question-auditor/from_factory.py 2020s-final "The 2020s" 2020s --review 2020s

Reads question-factory/out/<pack>-ordered.json (in play order) and writes reviews/<pack>.json. Clue flags are
recomputed from the squad data with the current rules (33% of starts or more for a second position,
wingers are midfielders, English means born in England); RET comes from the factory's retired check.
Each card notes the fact-check quotes, the style score and any clue the question gives away.
Needs the factory's virtualenv, since it reads the squad database.
"""
import argparse
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / 'question-factory'))
import pack as factory  # noqa: E402
import squads  # noqa: E402

FLAGS = ['GK', 'DEF', 'MID', 'FWD', 'RET', 'ENG']
NAMES = {'GK': 'Goalkeeper', 'DEF': 'Defender', 'MID': 'Midfielder', 'FWD': 'Forward', 'RET': 'Retired', 'ENG': 'English'}


def spoilers(q, answers):
    """Other answers from the pack named in this question, other than as a team-mate or manager (those are
    clues on purpose). Naming one as a record anchor ("since Modric in 2018") gives away a fact from his own
    question (Lewis, 21 Nov 2026)."""
    pid = squads.find(q['answer'])
    known = {squads.norm(m['name']) for m in (squads.teammates(pid) + squads.managers(pid))} if pid else set()
    low = squads.norm(q['question'])
    out = []
    for a in dict.fromkeys(answers):
        if a == q['answer'] or squads.norm(a) in known or not squads._mentioned(a, low):
            continue
        # "Roberto Martínez" isn't Emiliano Martínez: skip a bare surname that follows another capitalised first name.
        words = a.split()
        if len(words) > 1 and squads.norm(a) not in low:
            before = re.findall(rf'(\w+)\s+{re.escape(words[-1])}', q['question'])
            if before and all(w[0].isupper() and w != words[0] for w in before):
                continue
        out.append(a)
    return out


def item(n, q, pack_title, category, answers=()):
    clues, _ = factory.profile_clues(q['answer'])
    clues['RET'] = bool(q.get('retiredEvidence', {}).get('retired', q['clues'].get('RET')))
    clues = {f: bool(clues[f]) for f in FLAGS}
    notes = []
    changed = [f for f in FLAGS if bool(q['clues'].get(f)) != clues[f]]
    if changed:
        notes.append('Clue flags recomputed with the current rules: ' + ', '.join(
            f"{NAMES[f]} {'yes' if clues[f] else 'no'}" for f in changed) + '.')
    pid = squads.find(q['answer'])
    if pid:
        share = squads.positions(pid)
        if share:
            notes.append('Starts by position: ' + ', '.join(f'{NAMES.get(k, k)} {v:.0%}' for k, v in sorted(share.items(), key=lambda kv: -kv[1])))
    ret = q.get('retiredEvidence') or {}
    if ret.get('quote') or ret.get('how'):
        notes.append(f"Retired: {'yes' if ret.get('retired') else 'no'} ({ret.get('quote') or ret.get('how')})")
    notes += factory.clue_hints(q['question'])
    notes += [p for p in factory.lint(q['answer'], q['acceptableAnswers'], q['question']) if 'meets the player at' in p]
    for other in spoilers(q, answers):
        notes.append(f'Names {other}, also an answer in this pack. Fine if he is part of the story (a famous meeting); '
                     'if he is only a record anchor ("since X", "breaking X\'s record"), use a year so his question isn\'t spoiled.')
    for c in q.get('claims', []):
        quote = next((x for x in c.get('quotes', []) if x), '')
        notes.append(f"{'✓' if c.get('final') == 'SUPPORTED' else '?'} {c['text']}" + (f' — “{quote}”' if quote else ''))
    style = q.get('style') or {}
    why = style.get('why', '')
    if why and not why.endswith(('.', '!', '?', ')')):  # the checker's note is capped; end on a full sentence
        cut = [m.end() for m in re.finditer(r'[.!?](?=\s)', why)]
        why = why[:cut[-1]] if cut else why
    issues = f"Style {style.get('score', '?')}/5. {why}".strip()
    return {
        'key': f'N{n}', 'kind': 'new', 'index': n - 1, 'pack': pack_title, 'category': category,
        'player': q['answer'], 'verdict': 'NEW', 'issues': issues, 'notes': notes,
        # the article and the exact revision the fact-check read, so a later audit sees the same text
        'sources': ([q['source']['url']] if q.get('source', {}).get('url') else [])
                   + ([f"https://en.wikipedia.org/w/index.php?oldid={q['source']['revid']}"] if q.get('source', {}).get('revid') else []),
        'proposed': {'question': q['question'], 'answers': q['acceptableAnswers'], 'clues': clues},
    }


def carry_over(out, items):
    """Keep earlier decisions when the pack is rebuilt: same player and same wording keeps its decision
    under its new key; anything reworded goes back to undecided."""
    dpath = out.with_suffix('.decisions.json')
    if not (out.exists() and dpath.exists()):
        return 0, 0
    old = {it['key']: it for it in json.loads(out.read_text())['items']}
    decisions = json.loads(dpath.read_text())
    by_text = {(old[k]['player'], old[k]['proposed']['question']): d for k, d in decisions.items() if k in old}
    kept = {}
    for it in items:
        d = by_text.get((it['player'], it['proposed']['question']))
        if d:
            kept[it['key']] = d
    dpath.write_text(json.dumps(kept, indent=1, ensure_ascii=False) + '\n')
    return len(kept), len(decisions) - len(kept)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pack', help='factory output to read: question-factory/out/<pack>-ordered.json')
    ap.add_argument('title')
    ap.add_argument('category')
    ap.add_argument('--review', help='review name, if not the same as pack (e.g. a second pass merged into 2020s-final)')
    a = ap.parse_args()
    name = a.review or a.pack
    qs = json.loads((ROOT / 'question-factory' / 'out' / f'{a.pack}-ordered.json').read_text())
    answers = [q['answer'] for q in qs]
    items = [item(i + 1, q, a.title, a.category, answers) for i, q in enumerate(qs)]
    out = HERE / 'reviews' / f'{name}.json'
    kept, dropped = carry_over(out, items)
    out.write_text(json.dumps({'name': name, 'title': f'New pack: {a.title}', 'items': items}, indent=1, ensure_ascii=False) + '\n')
    flips = sum(1 for it in items if it['notes'] and it['notes'][0].startswith('Clue flags recomputed'))
    print(f'{len(items)} items -> {out.relative_to(ROOT)} ({flips} with recomputed flags; '
          f'{kept} earlier decisions kept, {dropped} dropped because the question changed or left the pack)')


if __name__ == '__main__':
    main()
