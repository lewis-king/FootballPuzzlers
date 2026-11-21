"""Pick and order a pack's questions from pack.py's output so it gets harder as you go.

Usage: factory/.venv/bin/python factory/assemble.py 2020s [--size 60]

Lewis's packs rise in difficulty without being strictly sorted: well-known players come first, cult
names and obscure facts later, and the odd famous name turns up late with a hard question (Terry,
Torres and Lukaku sit near the end of the Starter Pack). So:
- difficulty = how hard the question reads (the style judge's 1-5) blended with how famous the
  player is (peak Transfermarkt value as a proxy, 1 = superstar, 5 = cult);
- questions are sorted by it, then shuffled within small windows (fixed seed) so neighbours vary;
- the pack is filled across three bands (easier, middle, harder) by style score, so it doesn't end up
  all superstars.
Writes factory/out/<pack>-ordered.json. Lewis's review has the final say on wording and order.
"""
import argparse
import json
import pathlib
import random
import sys

HERE = pathlib.Path(__file__).parent
sys.path.insert(0, str(HERE))
import squads  # noqa: E402
from cachefile import write_json  # noqa: E402


def fame_difficulty(player):
    pid = squads.find(player)
    v = (squads.profile(pid)['peakValue'] or 0) / 1e6 if pid else 0
    for limit, d in [(100, 1), (60, 2), (35, 3), (15, 4)]:
        if v >= limit:
            return d
    return 5


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('pack')
    ap.add_argument('--size', type=int, default=60)
    ap.add_argument('--window', type=int, default=6)
    a = ap.parse_args()
    recs = json.loads((HERE / 'out' / f'{a.pack}.json').read_text())
    ready = [r for r in recs if r['status'] == 'READY']
    for r in ready:
        r['fame'] = fame_difficulty(r['answer'])
        r['difficulty'] = round(0.6 * r['style'].get('difficulty', 3) + 0.4 * r['fame'], 2)
    ready.sort(key=lambda r: r['difficulty'])

    # three bands by difficulty, each filled with its best-written questions
    n = len(ready)
    bands = [ready[:n // 3], ready[n // 3: 2 * n // 3], ready[2 * n // 3:]]
    per = [a.size // 3 + (1 if i < a.size % 3 else 0) for i in range(3)]
    chosen = []
    for band, k in zip(bands, per):
        chosen += sorted(band, key=lambda r: -r['style'].get('score', 0))[:k]
    chosen.sort(key=lambda r: r['difficulty'])

    rng = random.Random(2026)
    ordered = []
    for i in range(0, len(chosen), a.window):
        w = chosen[i:i + a.window]
        rng.shuffle(w)
        ordered += w
    for i, r in enumerate(ordered, 1):
        r['position'] = i
    write_json(HERE / 'out' / f'{a.pack}-ordered.json', ordered, indent=1)
    left = [r['answer'] for r in ready if r not in ordered]
    print(f'{len(ordered)} questions ({len(ready)} ready, {len(recs) - len(ready)} need work); '
          f'left out: {", ".join(left) or "none"}')
    for r in ordered:
        print(f"{r['position']:3} {r['difficulty']:4} {r['answer']}")


if __name__ == '__main__':
    main()
