"""Run the fact-checker over the labelled eval set and report where it fails.

Usage: python3 question-factory/evals/run.py [--limit N] [--models qwen3.8:27b,gemma4:31b]
Writes question-factory/evals/report.md and appends one row to question-factory/evals/history.csv, so every change
to prompts, retrieval or models can be compared with the last run.

Scoring per case:
  expect=facts           caught if any claim is not SUPPORTED
  expect=facts_or_dated  caught if a claim fails or the wording is dated
  expect=unique          caught if a model names another player who fits every clue
  expect=pass            a true question; a failed claim is a false alarm
"""
import argparse
import collections
import datetime
import json
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'question-factory'))
import factcheck  # noqa: E402
import wikipedia  # noqa: E402

HERE = pathlib.Path(__file__).parent


def caught(c, facts_ok, dated, others):
    e = c['expect']
    if e == 'facts':
        return not facts_ok
    if e == 'facts_or_dated':
        return not facts_ok or dated
    if e == 'unique':
        return bool(others)
    return facts_ok      # 'pass': correct when facts are OK


def single_model_facts(it, m):
    return all(factcheck.RANK[c['models'][m]['final']] == 0 for c in it['claims'])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--limit', type=int)
    ap.add_argument('--models', default=','.join(factcheck.MODELS))
    a = ap.parse_args()
    models = a.models.split(',')
    cases = [json.loads(l) for l in (HERE / 'cases.jsonl').read_text().splitlines() if l.strip()]
    if a.limit:
        cases = cases[:a.limit]
    for c in cases:
        c['lines'] = wikipedia.sentences(wikipedia.article(c['player'])['text'])
    factcheck.run_batch(cases, models)

    by_cat = collections.defaultdict(lambda: [0, 0])
    per_model = {m: [0, 0] for m in models}
    misses, rows = [], []
    for c in cases:
        ok = caught(c, c['factsOk'], c['dated'], c['others'])
        by_cat[c['category']][0] += ok
        by_cat[c['category']][1] += 1
        if c['expect'] in ('facts', 'pass'):
            for m in models:
                per_model[m][0] += caught(c, single_model_facts(c, m), c['dated'], c['others'])
                per_model[m][1] += 1
        if not ok:
            bad = [f"{cl['text']} -> {cl['final']}" + ''.join(
                f" [{m.split(':')[0]}: {cl['models'][m]['final']}"
                f"{' (' + cl['models'][m].get('guard', '') + ')' if cl['models'][m].get('guard') else ''}]"
                for m in models) for cl in c['claims'] if cl['final'] != 'SUPPORTED']
            misses.append(f"- **{c['id']} {c['player']}** ({c['category']}{', ' + c['note'] if c['note'] else ''}): "
                          f"{c['question'][:220]!r}" + (f"\n  - failed claims: {'; '.join(bad)[:600]}" if bad else '')
                          + (f"\n  - others: {', '.join(c['others'])}" if c['others'] else ''))

    neg = [c for c in cases if not c['label']]
    pos = [c for c in cases if c['label']]
    recall = sum(caught(c, c['factsOk'], c['dated'], c['others']) for c in neg) / max(1, len(neg))
    false_alarm = sum(not c['factsOk'] for c in pos) / max(1, len(pos))
    def status(c):
        f = [cl['final'] for cl in c.get('claims', [])]
        return 'FAIL' if 'CONTRADICTED' in f else 'REVIEW' if 'NOT_FOUND' in f else 'PASS'
    tri = collections.Counter((('true' if c['label'] else 'false'), status(c))
                              for c in cases if c['expect'] in ('facts', 'pass'))
    leaked = [c for c in neg if c['expect'] == 'facts' and status(c) == 'PASS']
    dated_true = sum(c['dated'] for c in pos)
    nonunique_true = sum(bool(c['others']) for c in pos)

    lines = ['# Fact-checker eval', '', f'{datetime.date.today()} · models {", ".join(models)} · '
             f'prompt {factcheck.PROMPT_VERSION} · {len(cases)} cases', '',
             f'**False questions caught: {recall:.0%}** ({len(neg)}). '
             f'**True questions wrongly failed on facts: {false_alarm:.0%}** ({len(pos)}).', '',
             f'True originals also flagged as dated wording: {dated_true}; as not unique: {nonunique_true} '
             '(informational: old present-tense records are dated by our rules).', '',
             '## Pass / review / fail (fact cases)', '',
             'PASS goes through, REVIEW goes to a person or back to the writer, FAIL is rejected. '
             'The number that matters most is false questions that PASS.', '',
             '| | PASS | REVIEW | FAIL |', '|---|---|---|---|',
             *[f"| {k} questions | {tri[(k, 'PASS')]} | {tri[(k, 'REVIEW')]} | {tri[(k, 'FAIL')]} |"
               for k in ('true', 'false')], '',
             *([f'False questions that passed: ' + '; '.join(f"{c['id']} {c['player']}" for c in leaked), '']
               if leaked else []),
             '| Category | Correct | Cases |', '|---|---|---|',
             *[f'| {k} | {v[0]} | {v[1]} |' for k, v in sorted(by_cat.items())], '',
             '## Each model alone vs together (facts and true-question cases)', '',
             '| Checker | Correct | Cases |', '|---|---|---|',
             *[f'| {m} | {v[0]} | {v[1]} |' for m, v in per_model.items()], '',
             '## Misses and false alarms', '', *misses, '']
    (HERE / 'report.md').write_text('\n'.join(lines))
    hist = HERE / 'history.csv'
    if not hist.exists():
        hist.write_text('date,prompt,models,cases,recall,false_alarm\n')
    with hist.open('a') as f:
        f.write(f'{datetime.datetime.now():%Y-%m-%dT%H:%M},{factcheck.PROMPT_VERSION},{"+".join(models)},'
                f'{len(cases)},{recall:.3f},{false_alarm:.3f}\n')
    print('\n'.join(lines[:22]))


if __name__ == '__main__':
    main()
