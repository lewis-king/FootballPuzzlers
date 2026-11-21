import { CLUES, PACKS, PackId, Pack, Question, questionsIn, QUESTIONS } from '../lib/game';
import type { SaveData } from '../lib/saveCode';

export const isFree = (p: Pack) => !p.sku;
export const owns = (p: Pack, purchased: string[]) => isFree(p) || purchased.includes(p.sku!);

export function packStats(pack: PackId, answered: number[]) {
  const qs = questionsIn(pack);
  const done = new Set(answered);
  const solved = qs.filter((q) => done.has(q.id)).length;
  const nextIndex = qs.findIndex((q) => !done.has(q.id));
  return { total: qs.length, solved, nextIndex, next: nextIndex >= 0 ? qs[nextIndex] : undefined };
}

/** Position of a question within its pack, 1-based, as shown on tiles and the nav bar. */
export const numberInPack = (q: Question) => questionsIn(q.pack).findIndex((x) => x.id === q.id) + 1;

/** The next unanswered question after this one in the pack, wrapping round. */
export function nextUnanswered(q: Question, answered: number[]): Question | undefined {
  const qs = questionsIn(q.pack);
  const done = new Set(answered);
  const at = qs.findIndex((x) => x.id === q.id);
  for (let i = 1; i <= qs.length; i++) {
    const c = qs[(at + i) % qs.length];
    if (!done.has(c.id)) return c;
  }
  return undefined;
}

export const solvedWithoutHelp = (s: SaveData) =>
  s.answered.filter((id) => !(s.clues[id] ?? 0) && !(s.letters[id] ?? 0)).length;

export function describeHelp(clueMask: number, letters: number) {
  const clues = CLUES.filter((_, i) => clueMask & (1 << i)).length;
  if (!clues && !letters) return 'Solved without any help';
  const parts = [];
  if (clues) parts.push(`${clues} clue${clues > 1 ? 's' : ''}`);
  if (letters) parts.push(`${letters} letter${letters > 1 ? 's' : ''}`);
  return `Solved with ${parts.join(' and ')}`;
}

/** One line per pack for the Enter a code and Welcome back screens. */
export function summarise(answered: number[]) {
  return PACKS.map((p) => ({ pack: p, ...packStats(p.id, answered) })).filter((x) => x.solved > 0);
}

export const totalQuestions = QUESTIONS.length;
