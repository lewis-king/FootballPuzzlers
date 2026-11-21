"""Merge a second factory pass into the first, one record per player.

Usage: factory/.venv/bin/python factory/merge_pass.py 2020s 2020s-b 2020s-final

A player redrafted in the second pass takes the new question when it came out READY; otherwise the
first pass's record stands. Players only in one pass are kept as they are. Writes
factory/out/<out>.json for assemble.py, and leaves both inputs untouched.
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
        if r['status'] == 'READY' or r['answer'] not in a:
            a[r['answer']] = r
            took.append(r['answer'])
        else:
            kept.append(r['answer'])
    write_json(HERE / 'out' / f'{out}.json', list(a.values()), indent=1)
    print(f'{len(a)} players -> out/{out}.json; second pass used for {len(took)}, first pass kept for {len(kept)}')
    if kept:
        print('first pass kept (second pass not READY):', ', '.join(kept))


if __name__ == '__main__':
    main(*sys.argv[1:4])
