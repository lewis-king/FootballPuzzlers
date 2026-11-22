"""Build the labelled eval set for the fact-checker: question-factory/evals/cases.jsonl.

Sources, each tagged with a category so the report shows where the checker is weak:
- fallen_record, wrong_when_written, out_of_date: originals the November 2026 audit found false.
- not_unique: originals where other players fit every clue (tests the uniqueness check, not facts).
- generated_error: drafts from the factory with an error caught by hand.
- true_original: originals whose text the audit kept (verdict KEEP or FIX-FLAGS).
- perturbed_*: a true original with ONE detail changed (year, number, round, club, count word).
  These are the subtle errors a human reviewer would otherwise have to catch.
- review_*: questions Lewis has approved or rejected in review (added by the review page later).

Usage: python3 question-factory/evals/build_cases.py
"""
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'question-factory'))
import wikipedia  # noqa: E402

OUT = pathlib.Path(__file__).parent / 'cases.jsonl'
FALLEN = [13, 22, 43, 48, 56, 57, 91, 100, 104, 125, 134, 144, 154, 159, 163, 172, 181, 198]
OUT_OF_DATE = [110, 130, 183, 210]
WRONG = [66, 25, 26, 30, 85, 96, 106, 119, 149, 170, 202, 206]
NOT_UNIQUE = [27, 29, 40, 158, 164, 167, 168, 169, 171, 173, 205]
GENERATED_ERRORS = [
    ('Ollie Watkins', "I once scored a perfect hat-trick in my club's heaviest defeat in 57 years. Incredibly, I later "
                      "became that same club's all-time top Premier League scorer.", 'subject shifted to my club'),
    ('Rodri', "I've played with the likes of Guardiola at City before moving to Barcelona.", 'manager is not a team-mate'),
]
CLUB_SWAPS = [('Chelsea', 'Arsenal'), ('Arsenal', 'Tottenham'), ('Tottenham', 'Chelsea'), ('Liverpool', 'Everton'),
              ('Everton', 'Liverpool'), ('Manchester United', 'Manchester City'), ('Manchester City', 'Manchester United'),
              ('Barcelona', 'Real Madrid'), ('Real Madrid', 'Barcelona'), ('Juventus', 'Inter Milan'),
              ('Bayern', 'Dortmund'), ('Newcastle', 'Sunderland'), ('Aston Villa', 'Birmingham')]
WORD_SWAPS = [(r'\bquarter-finals?\b', 'semi-final'), (r'\bsemi-finals?\b', 'quarter-final'),
              (r'\bonce\b', 'twice'), (r'\btwice\b', 'three times'), (r'\bfirst\b', 'second'),
              (r'\bsecond\b', 'third'), (r'\bnever\b', 'twice')]


def audit_verdicts():
    v = {}
    for f in (ROOT / 'research_notes' / 'question-audit').glob('*.md'):
        cur = None
        for line in f.read_text().splitlines():
            m = re.match(r'### Q(\d+):', line)
            if m:
                cur = int(m.group(1))
            m = re.match(r'- Verdict: (\S+)', line)
            if m and cur is not None:
                v.setdefault(cur, []).append(m.group(1))
    return {k: vs[0] for k, vs in v.items() if len(vs) == 1}   # skips the duplicated 201


def perturb(q, evidence_text):
    """One-detail mutations of a true question. Each returns (text, kind, change)."""
    out = []
    m = re.search(r'\b(19[5-9]\d|20[0-2]\d)\b', q)
    if m:
        y = str(int(m.group(1)) + 2)
        out.append((q[:m.start()] + y + q[m.end():], 'year', f'{m.group(1)} -> {y}'))
    for m in re.finditer(r'\b(\d{1,3})\b', q):
        n = int(m.group(1))
        if 1800 < n or n == 0:
            continue
        before = q[max(0, m.start() - 12):m.start()].lower()
        new = n * 3 if re.search(r'over|more than|at least|than', before) else n + max(3, n // 2)
        out.append((q[:m.start()] + str(new) + q[m.end():], 'number', f'{n} -> {new}'))
        break
    for a, b in CLUB_SWAPS:
        if re.search(rf'\b{a}\b', q) and b.lower() not in evidence_text.lower() and b not in q:
            out.append((re.sub(rf'\b{a}\b', b, q, count=1), 'club', f'{a} -> {b}'))
            break
    for pat, rep in WORD_SWAPS:
        m = re.search(pat, q, re.I)
        # skip when the replacement is already in the question ("quarter-final and semi-final legs"
        # would become "semi-final and semi-final legs": garbled, not a subtle error)
        if m and not re.search(rf'\b{re.escape(rep)}', q, re.I):
            out.append((q[:m.start()] + rep + q[m.end():], 'word', f'{m.group(0)} -> {rep}'))
            break
    return out


def main():
    qs = {}
    for q in json.loads((ROOT / 'config' / 'baseQuestions.json').read_text()):
        qs.setdefault(q['id'], q)
    verdicts = audit_verdicts()
    cases = []

    def add(cid, player, text, label, category, expect, note=''):
        cases.append({'id': cid, 'player': player, 'question': text, 'label': label,
                      'category': category, 'expect': expect, 'note': note})

    for ids, cat in [(FALLEN, 'fallen_record'), (OUT_OF_DATE, 'out_of_date'), (WRONG, 'wrong_when_written')]:
        for i in ids:
            add(f'Q{i}', qs[i]['acceptableAnswers'][0], qs[i]['question'], False, cat,
                'facts_or_dated' if cat != 'wrong_when_written' else 'facts')
    for i in NOT_UNIQUE:
        add(f'Q{i}', qs[i]['acceptableAnswers'][0], qs[i]['question'], False, 'not_unique', 'unique')
    for n, (p, t, why) in enumerate(GENERATED_ERRORS):
        add(f'G{n}', p, t, False, 'generated_error', 'facts', why)

    # Q170 (Alisson) is listed as wrong_when_written by the audit but its facts are true; it is a uniqueness failure.
    for c in cases:
        if c['id'] == 'Q170':
            c['category'], c['expect'] = 'not_unique', 'unique'

    rotate = 0
    for i, v in sorted(verdicts.items()):
        if v not in ('KEEP', 'FIX-FLAGS') or i not in qs:
            continue
        q, player = qs[i]['question'], qs[i]['acceptableAnswers'][0]
        add(f'Q{i}', player, q, True, 'true_original', 'pass')
        try:
            ev = wikipedia.article(player)['text']
        except LookupError:
            continue
        muts = perturb(q, ev)
        if muts:   # one mutation per question, rotating kinds so every kind is represented
            text, kind, change = muts[rotate % len(muts)]
            rotate += 1
            add(f'Q{i}-{kind}', player, text, False, f'perturbed_{kind}', 'facts', change)

    OUT.write_text('\n'.join(json.dumps(c, ensure_ascii=False) for c in cases) + '\n')
    from collections import Counter
    print(len(cases), 'cases ->', OUT)
    print(Counter(c['category'] for c in cases))


if __name__ == '__main__':
    main()
