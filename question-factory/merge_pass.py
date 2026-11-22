"""Merge a second factory pass into the first, one record per player.

Usage: question-factory/.venv/bin/python question-factory/merge_pass.py 2020s 2020s-b 2020s-final

A player redrafted in the second pass takes the new question, because it was written and judged under
the newer, stricter rules, even when it still needs work (its card says why). The first pass's
record stands only when the second has a wrong or unsupported fact and the first came out READY. Players only in one pass are kept as they are. Writes
question-factory/out/<out>.json for assemble.py, and leaves both inputs untouched.
"""
import json
import pathlib
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))
from cachefile import write_json  # noqa: E402


def main(first, second, out):
    a = {r['answer']: r for r in json.loads((HERE / 'out' / f'{first}.json').read_text())}
    b = json.loads((HERE / 'out' / f'{second}.json').read_text())
    took, kept = [], []
    for r in b:
        old = a.get(r['answer'])
        factual = any(p.startswith(('claim is wrong', 'claim not stated')) for p in r['problems'])
        if not (factual and old and old['status'] == 'READY'):
            a[r['answer']] = r
            took.append(r['answer'])
        else:
            kept.append(r['answer'])
    write_json(HERE / 'out' / f'{out}.json', list(a.values()), indent=1)
    print(f'{len(a)} players -> out/{out}.json; second pass used for {len(took)}, first pass kept for {len(kept)}')
    if kept:
        print('first pass kept (second pass has a factual problem):', ', '.join(kept))


if __name__ == '__main__':
    main(*sys.argv[1:4])
