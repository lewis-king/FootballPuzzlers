"""Draft a question for one player from Wikipedia evidence, then verify it with a second model.

Usage: python3 factory/generate.py "Bukayo Saka" [more players...]
Writes factory/out/<player>.json for review. Nothing here touches the app's question files.
"""
import json
import pathlib
import re
import sys
import time

sys.path.insert(0, str(pathlib.Path(__file__).parent))
import llm  # noqa: E402
import wikipedia  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = pathlib.Path(__file__).parent / 'out'

# Lewis's originals that passed the audit unchanged AND show his storytelling style (see STYLE.md).
STYLE_IDS = [9, 32, 37, 38, 51, 59, 82, 117, 124, 131, 132, 133, 148, 211]
STYLE_GUIDE = (pathlib.Path(__file__).parent / 'STYLE.md').read_text()

STYLE_RULES = ("You write questions for 'Football - Who am I?', a guess-the-player quiz, in the voice of "
               "its creator. Follow this style guide closely; the storytelling voice matters as much as the facts.\n\n"
               + STYLE_GUIDE +
               "\n\nOutput rules: ONLY use facts stated in the numbered evidence. List every fact you used as a claim, "
               "citing evidence line numbers there. The question text itself never contains brackets or line numbers.")

DRAFT_SCHEMA = {
    'type': 'object',
    'properties': {
        'question': {'type': 'string'},
        'claims': {'type': 'array', 'items': {'type': 'object', 'properties': {
            'text': {'type': 'string'},
            'evidence': {'type': 'array', 'items': {'type': 'integer'}},
            'shelfLife': {'type': 'string', 'enum': ['TIMELESS', 'RECORD']},
        }, 'required': ['text', 'evidence', 'shelfLife']}},
        'retired': {'type': 'boolean'},
        'retiredEvidence': {'type': 'array', 'items': {'type': 'integer'}},
    },
    'required': ['question', 'claims', 'retired', 'retiredEvidence'],
}

VERIFY_SCHEMA = {
    'type': 'object',
    'properties': {
        'claims': {'type': 'array', 'items': {'type': 'object', 'properties': {
            'text': {'type': 'string'},
            'supported': {'type': 'boolean'},
            'quote': {'type': 'string'},
            'problem': {'type': 'string'},
        }, 'required': ['text', 'supported', 'quote', 'problem']}},
        'everyClaimInQuestion': {'type': 'boolean'},
        'givesAwayName': {'type': 'boolean'},
        'datedWording': {'type': 'boolean'},
        'otherPlayersWhoFit': {'type': 'array', 'items': {'type': 'string'}},
        'storyScore': {'type': 'integer', 'minimum': 1, 'maximum': 5},
        'storyNote': {'type': 'string'},
        'verdict': {'type': 'string', 'enum': ['PASS', 'FIX', 'REJECT']},
        'notes': {'type': 'string'},
    },
    'required': ['claims', 'everyClaimInQuestion', 'givesAwayName', 'datedWording',
                 'otherPlayersWhoFit', 'storyScore', 'storyNote', 'verdict', 'notes'],
}


def examples():
    qs = {q['id']: q for q in json.loads((ROOT / 'config' / 'baseQuestions.json').read_text())}
    return '\n\n'.join(f"Answer: {qs[i]['acceptableAnswers'][0]}\nQuestion: {qs[i]['question']}" for i in STYLE_IDS)


def numbered(lines):
    return '\n'.join(f'[{i}] {l}' for i, l in enumerate(lines))


def draft(player, lines):
    user = (f'Examples of the house style:\n\n{examples()}\n\n---\n\n'
            f'Write one new question whose answer is {player}.\n\nEvidence:\n{numbered(lines)}')
    return llm.chat_json(llm.WRITER, STYLE_RULES, user, DRAFT_SCHEMA, temperature=0.7, num_ctx=32768)


def verify(player, lines, d):
    claims = '\n'.join(f"- {c['text']} (cites {c['evidence']})" for c in d['claims'])
    system = ('You are a strict football fact-checker. Judge each claim ONLY against the numbered evidence. '
              'A claim is supported only if a line states it; quote that line. Be sceptical of superlatives '
              '("first", "only", "most", "record"). Check WHO each fact is about: a fact the evidence states about '
              'an opponent, a team-mate, a club or a country is not a fact about the player or "my club" '
              '(e.g. "the opponent\'s heaviest defeat" is not "my club\'s heaviest defeat"). A manager is not '
              'someone the player "played with". If the wording shifts the subject or meaning of the evidence, '
              'the claim is NOT supported. Then judge the question as a quiz item.')
    user = (f'Intended answer: {player}\n\nQuestion:\n{d["question"]}\n\nClaims:\n{claims}\n\n'
            f'Checks:\n1. Is each claim supported by the evidence? Quote the line.\n'
            f'2. Does the question contain any fact NOT in the claims list? (everyClaimInQuestion=false if so)\n'
            f'3. Does it give away the name?\n'
            f'4. datedWording=true if it uses "currently", "still", "as of", "this season", OR states a record, '
            f'"first", "only" or "most" in the present tense without tying it to a moment ("I hold the record", '
            f'"I\'m the only player", "the most of all time"). Records get broken, so they must read like '
            f'"In 2023 I became the first..." or "I once held the record...". Being a club\'s or country\'s '
            f'all-time top scorer counts too. A team or award count ("never won a league", "won it once") is '
            f'dated as well if the player is still playing.\n'
            f'5. From your football knowledge, which other players could also fit EVERY clue?\n'
            f'6. storyScore 1-5: does it read like a short story in the player\'s voice, with connected sentences '
            f'and a twist or tension (5), or a flat list of separate facts (1)? Explain in storyNote.\n'
            f'Verdict: PASS only if all claims are supported, datedWording is false, the answer is unique '
            f'and storyScore >= 4; '
            f'FIX if the wording or one claim needs work; REJECT otherwise.\n\n'
            f'Evidence:\n{numbered(lines)}')
    return llm.chat_json(llm.CHECKER, system, user, VERIFY_SCHEMA, temperature=0.1, num_ctx=32768)


def final_verdict(v):
    """Apply the PASS rule in code so the checker's own verdict can only make things stricter."""
    if v.get('verdict') in ('ERROR', 'REJECT'):
        return v.get('verdict')
    ok = (all(c['supported'] for c in v['claims']) and v.get('everyClaimInQuestion', True)
          and not v.get('givesAwayName') and not v.get('datedWording')
          and not v.get('otherPlayersWhoFit') and v.get('storyScore', 0) >= 4)
    return 'PASS' if ok and v['verdict'] == 'PASS' else 'FIX'


def run(players):
    """Two passes so only one model is on the GPU at a time: draft everything, then verify everything."""
    jobs = []
    for player in players:
        doc = wikipedia.article(player)
        jobs.append({'player': player, 'doc': doc, 'lines': wikipedia.sentences(doc['text'])[:400]})
    for j in jobs:
        t = time.time()
        try:
            j['draft'] = draft(j['player'], j['lines'])
        except llm.BadOutput as e:
            print(f'[generate] skipping {j["player"]}: {e}', file=sys.stderr, flush=True)
            continue
        j['draft']['question'] = re.sub(r'\s*\[[\d,\s]+\]', '', j['draft']['question']).strip()
        j['t_draft'] = time.time() - t
    llm.unload(llm.WRITER)
    jobs = [j for j in jobs if 'draft' in j]
    for j in jobs:
        t = time.time()
        try:
            j['verification'] = verify(j['player'], j['lines'], j['draft'])
        except llm.BadOutput as e:
            j['verification'] = {'verdict': 'ERROR', 'claims': [], 'otherPlayersWhoFit': [],
                                 'storyScore': 0, 'storyNote': str(e)}
        j['verification']['verdict'] = final_verdict(j['verification'])
        j['t_verify'] = time.time() - t
    llm.unload(llm.CHECKER)

    OUT.mkdir(exist_ok=True)
    results = []
    for j in jobs:
        for c in j['draft']['claims']:
            c['evidenceText'] = [j['lines'][i] for i in c['evidence'] if 0 <= i < len(j['lines'])]
        r = {
            'answer': j['player'],
            'source': {'url': j['doc']['url'], 'revid': j['doc']['revid'], 'revisionTime': j['doc']['fetched']},
            'draft': j['draft'],
            'verification': j['verification'],
            'models': {'writer': llm.WRITER, 'checker': llm.CHECKER},
            'seconds': {'draft': round(j['t_draft']), 'verify': round(j['t_verify'])},
        }
        (OUT / f"{j['player'].replace(' ', '_')}.json").write_text(json.dumps(r, indent=1, ensure_ascii=False))
        results.append(r)
    return results


if __name__ == '__main__':
    for r in run(sys.argv[1:]):
        print(f"\n== {r['answer']}  [{r['verification']['verdict']}]  {r['seconds']}")
        print(r['draft']['question'])
        for c in r['verification']['claims']:
            print(f"  {'✓' if c['supported'] else '✗'} {c['text']}" + (f"  — {c['problem']}" if c['problem'] else ''))
        print('  others who fit:', r['verification']['otherPlayersWhoFit'],
              f"| story {r['verification']['storyScore']}/5: {r['verification']['storyNote']}")
