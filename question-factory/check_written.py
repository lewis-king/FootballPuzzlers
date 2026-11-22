"""Run hand-written questions through the same checks as the factory's own drafts.

Usage: question-factory/.venv/bin/python question-factory/check_written.py <questions.json> <pack> <out>

<questions.json> maps player name to question text (three lines). Each one gets the factory's lint,
the two-model fact-check against the player's evidence, the uniqueness and dated-wording checks and
the style judge. Records are written to question-factory/out/<out>.json in pack.py's format (taking clue flags,
answers, targets and retired evidence from question-factory/out/<pack>.json), ready for assemble.py and the
auditor. Use it for questions written or reworked by hand, so they meet the same bar.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))
import pack  # noqa: E402
from cachefile import write_json  # noqa: E402


def main(qfile, base, out):
    written = json.loads(pathlib.Path(qfile).read_text())
    known = {r['answer']: r for r in json.loads((HERE / 'out' / f'{base}.json').read_text())}
    players, cands = {}, []
    for n, q in written.items():
        doc, lines, squad = pack.evidence(n)
        flags, prof = pack.profile_clues(n)
        answers = known[n]['acceptableAnswers'] if n in known else pack.answers_for(n, prof)
        players[n] = {'doc': doc, 'lines': lines, 'ev': lines + squad, 'flags': flags, 'prof': prof, 'answers': answers}
        cands.append({'player': n, 'round': 'hand', 'hook': 'written by hand', 'question': q,
                      'target': known.get(n, {}).get('target'), 'writerClaims': [],
                      'lint': pack.lint(n, answers, q)})
    pack.check(cands, players)
    recs = []
    for c in cands:
        n, p, k = c['player'], players[c['player']], known.get(c['player'], {})
        probs = pack.problems_of(c)
        recs.append({
            'answer': n, 'acceptableAnswers': p['answers'],
            'clues': k.get('clues') or {**p['flags'], 'RET': False},
            'retiredEvidence': k.get('retiredEvidence', {}), 'target': c['target'],
            'status': 'READY' if not probs and c['style'].get('score', 0) >= 4 else 'NEEDS_WORK',
            'question': c['question'], 'problems': probs, 'style': c['style'], 'writtenByHand': True,
            'claims': [{'text': cl['text'], 'final': cl['final'],
                        'quotes': [r.get('supportQuote') for r in cl['models'].values() if r.get('final') == 'SUPPORTED']}
                       for cl in c['claims']],
            'source': {'url': p['doc']['url'], 'revid': p['doc']['revid']}, 'alternatives': [],
        })
        print(f"{n}: {recs[-1]['status']} style {c['style'].get('score')}" + ''.join(f'\n   ! {x}' for x in probs),
              flush=True)
    write_json(HERE / 'out' / f'{out}.json', recs, indent=1)


if __name__ == '__main__':
    main(*sys.argv[1:4])
