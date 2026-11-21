"""Check every question's ENG clue against Wikidata birthplace (ENG = born in England).

Usage: python3 factory/check_eng.py [questions.json]
Writes research_notes/question-audit/eng-birthplace.md
"""
import json
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import wikidata  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
path = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'config' / 'baseQuestions.json'
questions = json.loads(path.read_text())

names = sorted({q['acceptableAnswers'][0] for q in questions})
info = wikidata.lookup(names)

mismatch, unresolved, ok = [], [], 0
for q in questions:
    name = q['acceptableAnswers'][0]
    f = info.get(name)
    if not f or f.get('bornInEngland') is None:
        unresolved.append(f"| {q['id']} | {name} | not found on Wikidata |")
        continue
    if f['bornInEngland'] != q['clues']['ENG']:
        mismatch.append(f"| {q['id']} | {name} | {q['clues']['ENG']} | {f['bornInEngland']} | "
                        f"{f['birthplace']} | [{f['qid']}](https://www.wikidata.org/wiki/{f['qid']}) |")
    else:
        ok += 1

out = ROOT / 'research_notes' / 'question-audit' / 'eng-birthplace.md'
out.write_text('\n'.join([
    '# ENG clue vs birthplace (Wikidata)', '',
    'ENG means born in England (How to Play text). Checked automatically by `factory/check_eng.py`.', '',
    f'{ok} agree, {len(mismatch)} disagree, {len(unresolved)} unresolved.', '',
    '## Disagreements', '', '| Q | Player | ENG now | Born in England | Birthplace | Wikidata |',
    '|---|---|---|---|---|---|', *mismatch, '',
    '## Unresolved', '', '| Q | Player | Note |', '|---|---|---|', *unresolved, '',
]))
print(f'{ok} agree, {len(mismatch)} disagree, {len(unresolved)} unresolved -> {out}')
print('\n'.join(mismatch + unresolved))
