#!/usr/bin/env python3
"""Turn an audit's Markdown notes into a review file for the questions auditor.

Usage: python3 tools/question-auditor/extract_audit.py research_notes/question-audit 2026-11-audit

Reads every `### Q<id>` block (Verdict, Issues, Proposed question, Proposed flags, Shelf life,
Sources, Confidence) and the ENG birthplace check, pairs each with the live question in
config/baseQuestions.json, and writes tools/question-auditor/reviews/<name>.json.
Only definite flag changes are pre-filled; optional ones ("(optional)", "consider") are left for
Lewis to tick in Edit, with the note shown on the card.
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = pathlib.Path(__file__).resolve().parent
FLAGS = ['GK', 'DEF', 'MID', 'FWD', 'RET', 'ENG']
PACK = {'ENG1': 'Starter', 'WC': 'World Cup', 'CL': 'Champions League'}


def blocks(text):
    for m in re.finditer(r'^### Q(\d+)([ab]?): (.+?)\n(.*?)(?=^### |\Z)', text, re.S | re.M):
        qid, dup, player, body = int(m[1]), m[2], m[3].strip(), m[4]
        fields = dict(re.findall(r'^- ([A-Z][A-Za-z ]+): (.*)$', body, re.M))
        yield qid, dup, player, fields


def flag_changes(raw):
    """Definite changes only, e.g. 'RET false→true; FWD false→true (optional)' -> {'RET': True}."""
    out = {}
    for part in re.split(r'[;,]', raw or ''):
        m = re.search(r'\b(GK|DEF|MID|FWD|RET|ENG) (true|false)→(true|false)', part)
        if m and not re.search(r'optional|consider|re-check|unclear', part):
            out[m[1]] = m[3] == 'true'
    return out


def main(src, name):
    data = json.loads((ROOT / 'config' / 'baseQuestions.json').read_text())
    by_id = {}
    for i, q in enumerate(data):
        by_id.setdefault(q['id'], []).append((i, q))
    birth = {}
    bp = pathlib.Path(src) / 'eng-birthplace.md'
    if bp.exists():
        for m in re.finditer(r'^\| (\d+) \| (.+?) \| (True|False) \| (True|False) \| (.+?) \|', bp.read_text(), re.M):
            birth[int(m[1])] = {'eng': m[4] == 'True', 'place': m[5]}
    items = []
    for f in sorted(pathlib.Path(src).glob('*.md')):
        if f.name == 'eng-birthplace.md':
            continue
        for qid, dup, player, fd in blocks(f.read_text()):
            occ = {'': 0, 'a': 0, 'b': 1}[dup]
            index, cur = by_id[qid][occ]
            verdict = fd.get('Verdict', '').strip().split()[0]
            proposed_q = fd.get('Proposed question', '').strip() or None
            answers = None
            clues = dict(cur['clues'])
            if proposed_q:
                nm = re.match(r'\(New answer: ([^,]+), acceptable (.+?); flags (.+?)\.\)\s*(.*)', proposed_q)
                if nm:   # a replacement player
                    answers = re.findall(r'"([^"]+)"', nm[2])
                    clues = {k: False for k in FLAGS}
                    for k in re.findall(r'\b(GK|DEF|MID|FWD|RET|ENG) true', nm[3]):
                        clues[k] = True
                    proposed_q = nm[4]
                proposed_q = proposed_q.replace('\\n', '\n')
            clues.update(flag_changes(fd.get('Proposed flags')))
            notes = []
            if qid in birth and birth[qid]['eng'] != cur['clues']['ENG']:
                clues['ENG'] = birth[qid]['eng']
                notes.append(f"ENG means born in England; Wikidata gives {birth[qid]['place']}, so ENG becomes {str(birth[qid]['eng']).lower()}.")
                if verdict == 'KEEP':
                    verdict = 'FIX-FLAGS'
            if re.search(r'optional|consider|re-check|unclear|decide', fd.get('Proposed flags', '')):
                notes.append('Flags note: ' + fd['Proposed flags'])
            if dup:
                notes.append(f'Id {qid} is used twice in baseQuestions.json; this is occurrence {occ + 1}.')
            items.append({
                'key': f'Q{qid}{dup}', 'kind': 'change', 'id': qid, 'index': index,
                'pack': PACK.get(cur['category'], cur['category']), 'player': player, 'verdict': verdict,
                'issues': fd.get('Issues', ''), 'shelf': fd.get('Shelf life', ''), 'confidence': fd.get('Confidence', ''),
                'sources': [s.strip() for s in fd.get('Sources', '').split(' ; ') if s.strip()],
                'notes': notes,
                'current': {'question': cur['question'], 'answers': cur['acceptableAnswers'], 'clues': cur['clues']},
                'proposed': {'question': proposed_q or cur['question'], 'answers': answers or cur['acceptableAnswers'], 'clues': clues},
            })
    items.sort(key=lambda x: (x['index']))
    out = HERE / 'reviews' / f'{name}.json'
    out.write_text(json.dumps({'name': name, 'title': 'Question audit, November 2026', 'items': items}, indent=1, ensure_ascii=False) + '\n')
    from collections import Counter
    print(f'{len(items)} items -> {out.relative_to(ROOT)}', dict(Counter(i['verdict'] for i in items)))


if __name__ == '__main__':
    main(*sys.argv[1:3])
