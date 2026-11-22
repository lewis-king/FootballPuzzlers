#!/usr/bin/env python3
"""Write a review's approved and edited decisions into config/baseQuestions.json.

    python3 tools/question-auditor/apply.py 2026-11-audit [--dry-run]

Changes to existing questions are made in place, line by line, so the git diff shows only what
changed (the file's hand-made layout is kept). New questions (kind "new", e.g. a new pack) are
appended with fresh ids above the current highest; ids are never reused. Rejected and undecided
items are left alone. Each applied decision is stamped with "applied" in the decisions file, so
running this twice does nothing the second time. Then run `npm run questions` in mobile/.

It also keeps the review for good: config/provenance/<review>.json gets one record per question id
with the final wording, Lewis's decision (and the wording before any edit), the reviewer's verdict,
every note on the card (fact-check claims with their quotes, position shares, retired evidence,
edits Claude made and why) and the sources, including the exact Wikipedia revision checked. The app
never reads it; it's there for auditing a question later. `--provenance-only` (re)writes these
records for decisions already applied, without touching baseQuestions.json.
"""
import json
import pathlib
import re
import sys
import time

ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = pathlib.Path(__file__).resolve().parent
BASE = ROOT / 'config' / 'baseQuestions.json'
FLAGS = ['GK', 'DEF', 'MID', 'FWD', 'RET', 'ENG']
CATEGORY = {'Starter': 'ENG1', 'World Cup': 'WC', 'Champions League': 'CL'}
PROV = ROOT / 'config' / 'provenance'


def record(name, it, d, p, qid):
    """What Lewis saw and decided for one question, kept by its permanent id."""
    rec = {
        'id': qid, 'pack': it.get('pack'), 'player': it.get('player'),
        'question': p['question'], 'answers': p['answers'], 'clues': {f: bool(p['clues'][f]) for f in FLAGS},
        'decision': {k: d[k] for k in ('status', 'at', 'applied') if k in d},
        'review': {'name': name, 'card': it['key'], 'kind': it.get('kind')},
    }
    if it.get('kind') != 'new' and it.get('current'):
        rec['before'] = it['current'].get('question')
    if d['status'] == 'edited' and it['proposed']['question'] != p['question']:
        rec['proposedBeforeLewisEdit'] = it['proposed']['question']
    if d.get('note'):
        rec['lewisNote'] = d['note']
    for k in ('verdict', 'issues', 'shelf', 'confidence'):
        if it.get(k):
            rec[k] = it[k]
    rec['notes'] = it.get('notes', [])
    rec['sources'] = it.get('sources', [])
    return rec


def keep_provenance(name, records):
    if not records:
        return
    PROV.mkdir(parents=True, exist_ok=True)
    f = PROV / f'{name}.json'
    have = {str(r['id']): r for r in json.loads(f.read_text())} if f.exists() else {}
    have.update({str(r['id']): r for r in records})
    f.write_text(json.dumps(sorted(have.values(), key=lambda r: r['id']), indent=1, ensure_ascii=False) + '\n')
    print(f'{len(records)} provenance records -> {f.relative_to(ROOT)}')


def block_span(text, qid, occurrence):
    """Start and end of the object for this id (its nth occurrence), within the file text."""
    starts = [m.start() for m in re.finditer(rf'"id":\s*{qid}\s*,', text)]
    s = text.rfind('{', 0, starts[occurrence])
    e = text.index('"category"', s)
    e = text.index('}', e) + 1
    return s, e


def patch(block, q, answers, clues):
    block, n = re.subn(r'("question":\s*)"(?:[^"\\]|\\.)*"', lambda m: m[1] + json.dumps(q, ensure_ascii=False), block, count=1)
    assert n == 1
    block, n = re.subn(r'("acceptableAnswers":\s*)\[[^\]]*\]', lambda m: m[1] + json.dumps(answers, ensure_ascii=False), block, count=1)
    assert n == 1
    for f in FLAGS:
        block, n = re.subn(rf'("{f}":\s*)(true|false)', lambda m: m[1] + ('true' if clues[f] else 'false'), block, count=1)
        assert n == 1, f
    return block


def provenance_only(name):
    """Records for decisions already applied (new questions are matched to their id by wording)."""
    review = json.loads((HERE / 'reviews' / f'{name}.json').read_text())
    decisions = json.loads((HERE / 'reviews' / f'{name}.decisions.json').read_text())
    by_text = {q['question']: q['id'] for q in json.loads(BASE.read_text())}
    recs = []
    for it in review['items']:
        d = decisions.get(it['key'])
        if not d or not d.get('applied') or d['status'] not in ('approved', 'edited'):
            continue
        p = it['proposed'] if d['status'] == 'approved' else {k: d[k] for k in ('question', 'answers', 'clues')}
        qid = it.get('id') if it.get('kind') != 'new' else by_text.get(p['question'])
        if qid:
            recs.append(record(name, it, d, p, qid))
    keep_provenance(name, recs)


def main(name, dry):
    review = json.loads((HERE / 'reviews' / f'{name}.json').read_text())
    dpath = HERE / 'reviews' / f'{name}.decisions.json'
    decisions = json.loads(dpath.read_text()) if dpath.exists() else {}
    text = BASE.read_text()
    data = json.loads(text)
    next_id = max(q['id'] for q in data) + 1
    changed, added, new_objs, recs = [], [], [], []
    for it in review['items']:
        d = decisions.get(it['key'])
        if not d or d['status'] not in ('approved', 'edited') or d.get('applied'):
            continue
        p = it['proposed'] if d['status'] == 'approved' else {k: d[k] for k in ('question', 'answers', 'clues')}
        if it.get('kind') == 'new':
            qid = next_id; next_id += 1
            new_objs.append({'id': qid, 'questionId': qid, 'question': p['question'], 'acceptableAnswers': p['answers'],
                             'clues': {f: bool(p['clues'][f]) for f in FLAGS}, 'category': it.get('category') or CATEGORY.get(it['pack'], it['pack'])})
            added.append(f"{it['key']} -> id {qid}")
            recs.append(record(name, it, d, p, qid))
        else:
            occ = int(it.get('occurrence', {'': 0, 'a': 0, 'b': 1}.get(it['key'][-1] if it['key'][-1] in 'ab' else '', 0)))
            s, e = block_span(text, it['id'], occ)
            text = text[:s] + patch(text[s:e], p['question'], p['answers'], p['clues']) + text[e:]
            changed.append(it['key'])
            recs.append(record(name, it, d, p, it['id']))
        if not dry:
            d['applied'] = time.strftime('%Y-%m-%dT%H:%M:%S')
    if new_objs:
        body = ',\n'.join('  ' + json.dumps(o, ensure_ascii=False, indent=2).replace('\n', '\n  ') for o in new_objs)
        text = text.rstrip()
        assert text.endswith(']')
        text = text[:-1].rstrip() + ',\n' + body + '\n]\n'
    json.loads(text)  # still valid JSON
    print(f'{len(changed)} changed, {len(added)} added' + (' (dry run, nothing written)' if dry else ''))
    if changed:
        print('changed:', ', '.join(changed))
    if added:
        print('added:', ', '.join(added))
    if not dry and (changed or added):
        BASE.write_text(text)
        dpath.write_text(json.dumps(decisions, indent=1, ensure_ascii=False) + '\n')
        print('Now run: cd mobile && npm run questions')
    if not dry:
        for r in recs:
            r['decision']['applied'] = decisions[r['review']['card']].get('applied')
        keep_provenance(name, recs)


if __name__ == '__main__':
    if '--provenance-only' in sys.argv:
        provenance_only(sys.argv[1])
    else:
        main(sys.argv[1], '--dry-run' in sys.argv)
