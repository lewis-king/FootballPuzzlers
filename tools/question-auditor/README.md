# Questions auditor

A click-through review of proposed question changes. Each card shows a question as it is now and as proposed (with the changed words highlighted), its clue flags, the reason and the sources. You **Approve**, **Edit** or **Reject** it. Decisions save as you go, so you can stop and come back.

```
python3 tools/question-auditor/auditor.py          # open http://localhost:8790
python3 tools/question-auditor/apply.py <review> --dry-run
python3 tools/question-auditor/apply.py <review>   # writes config/baseQuestions.json
cd mobile && npm run questions                     # rebuilds the app's question data
```

Keys: **A** approve, **E** edit (⌘/Ctrl+Enter saves), **R** reject, **U** undo, **←/→** move.

## Where reviews come from

- **An audit of the existing questions:** write the findings as Markdown blocks (`### Q<id>: Player` with Verdict, Issues, Proposed question, Proposed flags, Shelf life, Sources, Confidence), as in `research_notes/question-audit/`, then
  `python3 tools/question-auditor/extract_audit.py research_notes/question-audit 2026-11-audit`.
  Only definite flag changes are pre-filled. Optional ones ("(optional)", "consider") show as a note for you to tick in Edit.
- **A new pack:** after `factory/assemble.py <pack>`, run
  `factory/.venv/bin/python tools/question-auditor/from_factory.py 2020s "The 2020s" 2020s` (pack, title, category).
  Items are `"kind": "new"` (no "Now" column), with clue flags recomputed under the current rules and the fact-check quotes as notes. Approved ones are appended with fresh ids above the current highest.

## Files

| File | What it is |
|---|---|
| `reviews/<name>.json` | The items to review |
| `reviews/<name>.decisions.json` | Your decisions, keyed by item (`Q4`, `Q201b`, …), stamped `applied` once written |
| `apply.py` | Edits only the lines that change, so the diff of `baseQuestions.json` stays readable |

Ids are permanent: progress, the 2019 import and save codes all store them. A replacement player keeps the old id.
