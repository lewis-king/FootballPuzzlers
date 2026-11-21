#!/usr/bin/env python3
"""Write a review's approved and edited decisions into config/baseQuestions.json.

    python3 tools/question-auditor/apply.py 2026-11-audit [--dry-run]

Changes to existing questions are made in place, line by line, so the git diff shows only what
changed (the file's hand-made layout is kept). New questions (kind "new", e.g. a new pack) are
appended with fresh ids above the current highest; ids are never reused. Rejected and undecided
items are left alone. Each applied decision is stamped with "applied" in the decisions file, so
running this twice does nothing the second time. Then run `npm run questions` in mobile/.
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


def main(name, dry):
    review = json.loads((HERE / 'reviews' / f'{name}.json').read_text())
    dpath = HERE / 'reviews' / f'{name}.decisions.json'
    decisions = json.loads(dpath.read_text()) if dpath.exists() else {}
    text = BASE.read_text()
    data = json.loads(text)
    next_id = max(q['id'] for q in data) + 1
    changed, added, new_objs = [], [], []
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
        else:
            occ = int(it.get('occurrence', {'': 0, 'a': 0, 'b': 1}.get(it['key'][-1] if it['key'][-1] in 'ab' else '', 0)))
            s, e = block_span(text, it['id'], occ)
            text = text[:s] + patch(text[s:e], p['question'], p['answers'], p['clues']) + text[e:]
            changed.append(it['key'])
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


if __name__ == '__main__':
    main(sys.argv[1], '--dry-run' in sys.argv)
