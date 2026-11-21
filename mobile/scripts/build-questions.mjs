// Build src/data/questions.json from the master question file (config/baseQuestions.json).
//
// Question ids are permanent: progress, the legacy Realm import and the save code all refer to
// them, so an id is never changed or reused. New questions take the next free id.
//
// Usage: node scripts/build-questions.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, '..', '..', 'config', 'baseQuestions.json');
const out = join(here, '..', 'src', 'data', 'questions.json');

const PACKS = { ENG1: 'starter', WC: 'worldcup', CL: 'champions', '2020s': 'twenties' };
const CLUES = ['GK', 'DEF', 'MID', 'FWD', 'RET', 'ENG'];

// The 2019 file gave id 201 to two questions. Realm upserted by id, so players only ever had the
// later one (Lucas Pérez) under 201; Beckham's question was never playable. Pérez keeps 201 so
// imported progress lines up, and Beckham moved to 212 in baseQuestions.json itself (20 Nov 2026).
// Any duplicate id now stops the build.

const raw = JSON.parse(readFileSync(src, 'utf8'));
const seen = new Set();
const questions = raw.map((q) => {
  const id = q.id;
  if (seen.has(id)) throw new Error(`Duplicate question id ${id}`);
  seen.add(id);
  const pack = PACKS[q.category];
  if (!pack) throw new Error(`Unknown category ${q.category} on question ${id}`);
  let clues = 0;
  CLUES.forEach((k, i) => { if (q.clues[k]) clues |= 1 << i; });
  return { id, pack, text: q.question.trim(), answers: q.acceptableAnswers, clues };
});

questions.sort((a, b) => a.id - b.id);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(questions));
const counts = questions.reduce((m, q) => ({ ...m, [q.pack]: (m[q.pack] || 0) + 1 }), {});
console.log(`Wrote ${questions.length} questions`, counts);
