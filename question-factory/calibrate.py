"""Measure the checker against questions whose truth we already know.

Known false: originals the November 2026 audit found wrong (records since broken, errors when
written), plus generated drafts a human caught. Known true: originals the audit kept unchanged.
Each question's sentences go to the checker as claims, with the player's Wikipedia article as
evidence. A good checker marks a known-false question unsupported and a known-true one supported.

Usage: python3 question-factory/calibrate.py            -> question-factory/cache/calibration.md
"""
import json
import pathlib
import re
import sys
import time

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import generate  # noqa: E402
import llm  # noqa: E402
import wikipedia  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
FALSE_IDS = [13, 22, 43, 48, 56, 57, 91, 100, 104, 125, 134, 144, 154, 159, 163, 172, 181, 198,
             110, 130, 183, 210, 66, 25, 26, 30, 85, 96, 106, 119, 149, 170, 202, 206]
TRUE_IDS = [1, 2, 3, 5, 9, 32, 37, 38, 51, 59, 82, 117, 124, 131, 132, 133]
CAUGHT = [  # generated drafts with an error Lewis or I caught by hand
    ('Ollie Watkins', "I once scored a perfect hat-trick in my club's heaviest defeat in 57 years."),
    ('Rodri', "I've played with the likes of Guardiola at City before moving to Barcelona."),
]


def cases():
    qs = {}
    for q in json.loads((ROOT / 'config' / 'baseQuestions.json').read_text()):
        qs.setdefault(q['id'], q)  # first 201 only
    out = [(qs[i]['acceptableAnswers'][0], qs[i]['question'], False, f'Q{i}') for i in FALSE_IDS]
    out += [(qs[i]['acceptableAnswers'][0], qs[i]['question'], True, f'Q{i}') for i in TRUE_IDS]
    out += [(p, text, False, 'draft') for p, text in CAUGHT]
    return out


def main():
    rows, tally = [], {'tp': 0, 'fn': 0, 'tn': 0, 'fp': 0}
    for player, text, truth, label in cases():
        doc = wikipedia.article(player)
        lines = wikipedia.sentences(doc['text'])[:400]
        sents = [s.strip() for s in re.split(r'(?<=[.?])\s+|\n', text) if s.strip()]
        d = {'question': text, 'claims': [{'text': s, 'evidence': []} for s in sents]}
        t = time.time()
        try:
            v = generate.verify(player, lines, d)
        except llm.BadOutput as e:
            rows.append(f'| {label} | {player} | {"true" if truth else "false"} | ERROR | {e} |')
            continue
        said_true = all(c['supported'] for c in v['claims']) and not v.get('datedWording')
        key = ('tn' if said_true else 'fp') if truth else ('fn' if said_true else 'tp')
        tally[key] += 1
        bad = '; '.join(f"{c['text'][:60]}: {c['problem']}" for c in v['claims'] if not c['supported'])
        if v.get('datedWording'):
            bad = 'DATED WORDING. ' + bad
        rows.append(f"| {label} | {player} | {'true' if truth else 'false'} | "
                    f"{'supported' if said_true else 'NOT supported'} {'✓' if key in ('tp', 'tn') else '✗'} | "
                    f"{bad.replace('|', '/')[:200]} |")
        print(rows[-1], f'({time.time() - t:.0f}s)', flush=True)
    llm.unload(llm.CHECKER)
    caught = tally['tp'] / max(1, tally['tp'] + tally['fn'])
    false_alarm = tally['fp'] / max(1, tally['fp'] + tally['tn'])
    report = ['# Checker calibration', '',
              f'Checker: {llm.CHECKER}. Evidence: the player\'s Wikipedia article only.', '',
              f"Known-false caught: {tally['tp']}/{tally['tp'] + tally['fn']} ({caught:.0%}). "
              f"Known-true wrongly flagged: {tally['fp']}/{tally['fp'] + tally['tn']} ({false_alarm:.0%}).", '',
              '| Case | Player | Actually | Checker | Problems it gave |', '|---|---|---|---|---|', *rows, '']
    (ROOT / 'question-factory' / 'cache' / 'calibration.md').write_text('\n'.join(report))
    print('\n'.join(report[:6]))


if __name__ == '__main__':
    main()
